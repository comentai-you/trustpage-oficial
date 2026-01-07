import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASAAS_API_URL = 'https://api.asaas.com/v3';

interface CheckoutRequest {
  user_id: string;
  email: string;
  full_name: string;
  cpf?: string;
  plan_type: 'essential' | 'pro';
}

// Extract and validate JWT from request
async function validateAuthAndGetUser(req: Request): Promise<{ userId: string; email: string } | null> {
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

  return { userId: user.id, email: user.email || '' };
}

// Validate and sanitize input
function validateInput(data: CheckoutRequest): { valid: boolean; error?: string; sanitized?: CheckoutRequest } {
  const { user_id, email, full_name, cpf, plan_type } = data;

  // Validate required fields
  if (!user_id || !email || !full_name || !plan_type) {
    return { valid: false, error: 'Missing required fields: user_id, email, full_name, plan_type' };
  }

  // Validate UUID format for user_id
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    return { valid: false, error: 'Invalid user_id format' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 255) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Validate plan_type
  if (plan_type !== 'essential' && plan_type !== 'pro') {
    return { valid: false, error: 'Invalid plan_type. Must be "essential" or "pro"' };
  }

  // Sanitize full_name (limit length, remove potentially dangerous characters)
  const sanitizedFullName = full_name
    .substring(0, 100)
    .replace(/[<>]/g, '');

  // Validate and sanitize CPF if provided
  let sanitizedCpf: string | undefined;
  if (cpf) {
    sanitizedCpf = cpf.replace(/\D/g, ''); // Remove non-digits
    if (sanitizedCpf.length !== 11) {
      return { valid: false, error: 'Invalid CPF format' };
    }
  }

  return {
    valid: true,
    sanitized: {
      user_id,
      email: email.toLowerCase().trim(),
      full_name: sanitizedFullName.trim(),
      cpf: sanitizedCpf,
      plan_type,
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    if (!asaasApiKey) {
      console.error('ASAAS_API_KEY not configured');
      throw new Error('Payment service not configured');
    }

    const requestBody: CheckoutRequest = await req.json();

    // Validate input
    const validation = validateInput(requestBody);
    if (!validation.valid || !validation.sanitized) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { user_id, email, full_name, cpf, plan_type } = validation.sanitized;

    // CRITICAL: Verify the requesting user matches the user_id in the request
    if (authUser.userId !== user_id) {
      console.error(`User ${authUser.userId} attempted to create checkout for different user ${user_id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - cannot create checkout for another user' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing checkout for user: ${user_id}, plan: ${plan_type}`);

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey,
    };

    // Step A: Check if customer exists or create new one
    console.log(`Searching for existing customer with email: ${email}`);
    
    const searchResponse = await fetch(`${ASAAS_API_URL}/customers?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers,
    });

    const searchData = await searchResponse.json();
    console.log('Customer search result:', JSON.stringify(searchData));

    let customerId: string;

    if (searchData.data && searchData.data.length > 0) {
      // Customer exists
      customerId = searchData.data[0].id;
      console.log(`Found existing customer: ${customerId}`);
    } else {
      // Create new customer
      console.log('Creating new customer...');
      
      const customerPayload: Record<string, string> = {
        name: full_name,
        email: email,
        externalReference: user_id,
      };

      if (cpf) {
        customerPayload.cpfCnpj = cpf;
      }

      const createCustomerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(customerPayload),
      });

      const customerData = await createCustomerResponse.json();
      
      if (!createCustomerResponse.ok) {
        console.error('Error creating customer:', JSON.stringify(customerData));
        throw new Error(customerData.errors?.[0]?.description || 'Failed to create customer');
      }

      customerId = customerData.id;
      console.log(`Created new customer: ${customerId}`);
    }

    // Step B: Create subscription
    const planConfig = {
      essential: {
        value: 39.90,
        description: 'TrustPage - Plano Essencial',
      },
      pro: {
        value: 79.90,
        description: 'TrustPage - Plano PRO',
      },
    };

    const plan = planConfig[plan_type];
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    console.log(`Creating subscription for customer ${customerId}: ${plan.description}`);

    const subscriptionPayload = {
      customer: customerId,
      billingType: 'UNDEFINED', // Allows any payment method
      value: plan.value,
      nextDueDate: today,
      cycle: 'MONTHLY',
      description: plan.description,
      externalReference: `${user_id}_${plan_type}`,
    };

    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(subscriptionPayload),
    });

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      console.error('Error creating subscription:', JSON.stringify(subscriptionData));
      throw new Error(subscriptionData.errors?.[0]?.description || 'Failed to create subscription');
    }

    console.log(`Subscription created: ${subscriptionData.id}`);

    // Get the first payment (invoice) to redirect user
    const paymentsResponse = await fetch(
      `${ASAAS_API_URL}/payments?subscription=${subscriptionData.id}&limit=1`,
      { method: 'GET', headers }
    );

    const paymentsData = await paymentsResponse.json();
    console.log('Payments data:', JSON.stringify(paymentsData));

    let invoiceUrl = subscriptionData.invoiceUrl;

    if (paymentsData.data && paymentsData.data.length > 0) {
      invoiceUrl = paymentsData.data[0].invoiceUrl || invoiceUrl;
    }

    if (!invoiceUrl) {
      console.error('No invoice URL found');
      throw new Error('Could not generate payment link');
    }

    console.log(`Checkout successful! Invoice URL: ${invoiceUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        invoiceUrl,
        subscriptionId: subscriptionData.id,
        customerId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error in asaas-checkout:', errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred processing your request',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
