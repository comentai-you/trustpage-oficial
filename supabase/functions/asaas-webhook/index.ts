import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
};

interface AsaasWebhookPayment {
  id: string;
  customer: string;
  subscription?: string;
  value: number;
  status: string;
  externalReference?: string;
  invoiceUrl?: string;
}

interface AsaasWebhookEvent {
  event: string;
  payment?: AsaasWebhookPayment;
  subscription?: {
    id: string;
    customer: string;
    status: string;
    externalReference?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData: AsaasWebhookEvent = await req.json();
    
    console.log('Received Asaas webhook:', JSON.stringify(webhookData));

    const { event, payment, subscription } = webhookData;

    // Handle payment events
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      if (!payment) {
        console.error('No payment data in webhook');
        return new Response(JSON.stringify({ error: 'No payment data' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Payment confirmed: ${payment.id}, Customer: ${payment.customer}, Value: ${payment.value}`);

      // Extract user_id and plan_type from externalReference (format: userId_planType)
      let userId: string | null = null;
      let planType: string = 'essential';

      if (payment.externalReference) {
        const parts = payment.externalReference.split('_');
        if (parts.length >= 2) {
          userId = parts[0];
          planType = parts[1];
        }
      }

      // If no externalReference, try to find user by Asaas customer ID
      if (!userId) {
        const { data: profileByCustomer } = await supabase
          .from('profiles')
          .select('id')
          .eq('asaas_customer_id', payment.customer)
          .maybeSingle();

        if (profileByCustomer) {
          userId = profileByCustomer.id;
        }
      }

      if (!userId) {
        console.error('Could not identify user from payment');
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Determine plan type from payment value if not in reference
      if (payment.value >= 69) {
        planType = 'pro';
      } else if (payment.value >= 29) {
        planType = 'essential';
      }

      // Update user subscription status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          plan_type: planType,
          asaas_customer_id: payment.customer,
          asaas_subscription_id: payment.subscription || null,
          subscription_updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log(`Successfully activated ${planType} plan for user ${userId}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription activated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle subscription cancellation
    if (event === 'PAYMENT_OVERDUE' || event === 'SUBSCRIPTION_DELETED' || event === 'SUBSCRIPTION_INACTIVE') {
      const customerId = payment?.customer || subscription?.customer;
      
      if (!customerId) {
        console.error('No customer ID in cancellation event');
        return new Response(JSON.stringify({ error: 'No customer ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find user by Asaas customer ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('asaas_customer_id', customerId)
        .maybeSingle();

      if (profile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('Error updating profile on cancellation:', updateError);
          throw updateError;
        }

        console.log(`Subscription cancelled for user ${profile.id}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription status updated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle payment refund
    if (event === 'PAYMENT_REFUNDED') {
      if (payment?.customer) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('asaas_customer_id', payment.customer)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'refunded',
              subscription_updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          console.log(`Payment refunded for user ${profile.id}`);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Refund processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log unhandled events
    console.log(`Unhandled event type: ${event}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Event received' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
