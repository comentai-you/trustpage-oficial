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

// Extract and validate JWT from request
async function validateAuthAndGetUser(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid authorization header');
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  // Create client with the user's JWT to verify it
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` }
    }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('Invalid JWT token:', error?.message);
    return null;
  }

  return { userId: user.id };
}

// Validate input data
function validateInput(data: ManageRequest): { valid: boolean; error?: string } {
  const { action, user_id, subscription_id, new_plan_type } = data;

  // Validate required fields
  if (!action || !user_id || !subscription_id) {
    return { valid: false, error: 'Missing required fields: action, user_id, subscription_id' };
  }

  // Validate action
  if (action !== 'cancel' && action !== 'change_plan') {
    return { valid: false, error: 'Invalid action. Must be "cancel" or "change_plan"' };
  }

  // Validate UUID format for user_id
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    return { valid: false, error: 'Invalid user_id format' };
  }

  // Validate subscription_id format (Asaas format: sub_xxxxx)
  if (!subscription_id.startsWith('sub_') || subscription_id.length < 10) {
    return { valid: false, error: 'Invalid subscription_id format' };
  }

  // Validate new_plan_type if action is change_plan
  if (action === 'change_plan') {
    if (!new_plan_type || (new_plan_type !== 'essential' && new_plan_type !== 'pro')) {
      return { valid: false, error: 'Invalid or missing new_plan_type for change_plan action' };
    }
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication first
    const authUser = await validateAuthAndGetUser(req);
    
    if (!authUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - valid authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const requestBody: ManageRequest = await req.json();

    // Validate input
    const validation = validateInput(requestBody);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { action, user_id, subscription_id, new_plan_type } = requestBody;

    // CRITICAL: Verify the requesting user matches the user_id in the request
    if (authUser.userId !== user_id) {
      console.error(`User ${authUser.userId} attempted to manage subscription for different user ${user_id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - cannot manage subscription for another user' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Additional verification: Check that the subscription_id belongs to this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('asaas_subscription_id')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (profile.asaas_subscription_id !== subscription_id) {
      console.error(`Subscription ID mismatch: user has ${profile.asaas_subscription_id}, requested ${subscription_id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription does not belong to this user' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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
        essential: { value: 39.90, description: 'TrustPage - Plano Essencial' },
        pro: { value: 79.90, description: 'TrustPage - Plano PRO' },
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
      JSON.stringify({ success: false, error: 'An error occurred processing your request' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
