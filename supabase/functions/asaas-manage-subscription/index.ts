import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASAAS_API_URL = 'https://api.asaas.com/v3';

interface ManageRequest {
  action: 'cancel' | 'change_plan';
  user_id: string;
  subscription_id: string;
  new_plan_type?: 'essential' | 'pro';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, user_id, subscription_id, new_plan_type }: ManageRequest = await req.json();

    console.log(`Managing subscription: action=${action}, user=${user_id}, subscription=${subscription_id}`);

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey,
    };

    if (action === 'cancel') {
      // Cancel subscription in Asaas
      const cancelResponse = await fetch(`${ASAAS_API_URL}/subscriptions/${subscription_id}`, {
        method: 'DELETE',
        headers,
      });

      const cancelData = await cancelResponse.json();
      console.log('Cancel response:', JSON.stringify(cancelData));

      if (!cancelResponse.ok && cancelResponse.status !== 404) {
        throw new Error(cancelData.errors?.[0]?.description || 'Failed to cancel subscription');
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_updated_at: new Date().toISOString(),
        })
        .eq('id', user_id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log(`Subscription cancelled for user ${user_id}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription cancelled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'change_plan' && new_plan_type) {
      const planConfig = {
        essential: { value: 29.90, description: 'TrustPage - Plano Essencial' },
        pro: { value: 69.90, description: 'TrustPage - Plano PRO' },
      };

      const plan = planConfig[new_plan_type];

      // Update subscription value in Asaas
      const updateResponse = await fetch(`${ASAAS_API_URL}/subscriptions/${subscription_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          value: plan.value,
          description: plan.description,
        }),
      });

      const updateData = await updateResponse.json();
      console.log('Update response:', JSON.stringify(updateData));

      if (!updateResponse.ok) {
        throw new Error(updateData.errors?.[0]?.description || 'Failed to update subscription');
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan_type: new_plan_type,
          subscription_updated_at: new Date().toISOString(),
        })
        .eq('id', user_id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      console.log(`Plan changed to ${new_plan_type} for user ${user_id}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Plan updated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error managing subscription:', errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
