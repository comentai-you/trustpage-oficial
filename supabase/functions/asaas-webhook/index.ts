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

// Validate webhook authenticity using Asaas access token header
function validateWebhookToken(req: Request): boolean {
  const webhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN');
  
  // SECURITY: Reject all requests if webhook token is not configured
  if (!webhookToken) {
    console.error('ASAAS_WEBHOOK_TOKEN not configured - rejecting webhook request for security');
    return false;
  }
  
  // Validate the received token against the configured token
  const receivedToken = req.headers.get('asaas-access-token');
  
  if (!receivedToken) {
    console.error('Missing asaas-access-token header in webhook request');
    return false;
  }
  
  const isValid = receivedToken === webhookToken;
  
  if (!isValid) {
    console.error('Invalid webhook token received');
  }
  
  return isValid;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook token first
    if (!validateWebhookToken(req)) {
      console.error('Invalid or missing webhook token - rejecting request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData: AsaasWebhookEvent = await req.json();
    
    console.log('Received Asaas webhook:', JSON.stringify(webhookData));

    const { event, payment, subscription } = webhookData;

    // Validate event type is a known Asaas event
    const validEvents = [
      'PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE', 
      'PAYMENT_REFUNDED', 'SUBSCRIPTION_DELETED', 'SUBSCRIPTION_INACTIVE'
    ];
    
    if (!validEvents.includes(event) && !event.startsWith('PAYMENT_') && !event.startsWith('SUBSCRIPTION_')) {
      console.warn(`Unknown event type received: ${event}`);
    }

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
        // Validate externalReference format (UUID_planType)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
        if (uuidRegex.test(payment.externalReference)) {
          const parts = payment.externalReference.split('_');
          if (parts.length >= 2) {
            userId = parts[0];
            planType = parts[1];
          }
        } else {
          console.warn(`Invalid externalReference format: ${payment.externalReference}`);
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

      // Validate planType
      if (planType !== 'essential' && planType !== 'pro') {
        // Determine plan type from payment value
        if (payment.value >= 69) {
          planType = 'pro';
        } else {
          planType = 'essential';
        }
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
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
