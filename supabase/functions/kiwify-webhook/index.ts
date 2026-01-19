import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-signature, x-webhook-token',
};

// Mapeamento de produtos Kiwify para planos
const PRODUCTS: Record<string, { plan: string; billing: string }> = {
  'P7MaOJK': { plan: 'essential', billing: 'monthly' },
  'f0lsmRn': { plan: 'pro', billing: 'monthly' },
  'f8Tg6DT': { plan: 'essential', billing: 'yearly' },
  'TQlihDk': { plan: 'pro', billing: 'yearly' },
  // IDs adicionais
  'b2e6a470-ed03-11f0-b1ef-038a6e106bac': { plan: 'pro', billing: 'monthly' },
  'bb3e9838-8717-495b-bda3-f61644c9e936': { plan: 'essential', billing: 'monthly' },
};

const SITE_URL = 'https://trustpageapp.com';

interface KiwifyPayload {
  order_id: string;
  order_status: string;
  product_id: string;
  product_name: string;
  signature?: string;
  webhook_token?: string;
  checkout_link?: string;
  Customer: {
    email: string;
    full_name: string;
    mobile?: string;
  };
  Subscription?: {
    id: string;
    status: string;
  };
}

/**
 * Calcula HMAC-SHA1 e retorna como string hexadecimal
 */
async function calculateHmacSha1(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = new Uint8Array(signature);
  
  // Converter para hexadecimal
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Extrai a assinatura da query string
 */
function extractSignatureFromUrl(req: Request): string | null {
  const url = new URL(req.url);
  const signature = url.searchParams.get('signature');
  
  if (signature) {
    console.log('📍 Signature found in query params');
    return signature.trim();
  }
  
  return null;
}

/**
 * Busca usuário por email com paginação
 */
async function findUserByEmail(supabase: any, email: string): Promise<any | null> {
  const normalizedEmail = email.toLowerCase().trim();
  let page = 1;
  const perPage = 50;
  const maxPages = 200;

  while (page <= maxPages) {
    const { data: usersPage, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error(`Error listing users (page ${page}):`, error.message);
      throw new Error('Failed to search users');
    }

    if (!usersPage?.users || usersPage.users.length === 0) {
      break;
    }

    const foundUser = usersPage.users.find(
      (u: any) => u.email?.toLowerCase() === normalizedEmail
    );

    if (foundUser) {
      console.log(`✅ User found on page ${page}: ${foundUser.id}`);
      return foundUser;
    }

    if (usersPage.users.length < perPage) {
      break;
    }

    page++;
  }

  console.log(`User not found after searching ${page} page(s)`);
  return null;
}

/**
 * Identifica o produto no payload
 */
function identifyProduct(payload: any): { key: string; config: { plan: string; billing: string } } | null {
  // Possíveis fontes do identificador do produto
  const possibleKeys = [
    payload.checkout_link,
    payload.product_id,
    payload.Product_ID,
    payload.Product?.product_id,
    payload.product?.id,
    payload.Product?.id,
  ].filter(Boolean);

  console.log('🔍 Checking product keys:', possibleKeys);

  for (const key of possibleKeys) {
    if (PRODUCTS[key]) {
      console.log(`✅ Product matched: ${key} -> ${JSON.stringify(PRODUCTS[key])}`);
      return { key, config: PRODUCTS[key] };
    }
  }

  console.log('❌ No matching product found');
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const webhookToken = Deno.env.get('KIWIFY_WEBHOOK_TOKEN');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('═══════════════════════════════════════════');
    console.log('🔔 KIWIFY WEBHOOK RECEIVED');
    console.log('═══════════════════════════════════════════');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📍 URL:', req.url);

    // ═══════════════════════════════════════════
    // PASSO 1: Ler o body BRUTO primeiro (antes de qualquer json())
    // ═══════════════════════════════════════════
    const rawBody = await req.text();
    console.log('📦 Raw body length:', rawBody.length);

    // ═══════════════════════════════════════════
    // PASSO 2: Extrair assinatura da URL
    // ═══════════════════════════════════════════
    const providedSignature = extractSignatureFromUrl(req);
    console.log('🔐 Provided signature:', providedSignature ? `[${providedSignature.substring(0, 10)}...]` : '[MISSING]');

    // ═══════════════════════════════════════════
    // PASSO 3: Calcular HMAC-SHA1 e validar
    // ═══════════════════════════════════════════
    if (webhookToken) {
      if (!providedSignature) {
        console.error('❌ SECURITY: No signature provided but token is configured');
        return new Response(
          JSON.stringify({ error: 'Unauthorized', reason: 'Missing signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calcular o HMAC-SHA1 do rawBody usando o token como chave
      const calculatedHash = await calculateHmacSha1(rawBody, webhookToken);
      
      console.log('🔑 Calculated HMAC:', `[${calculatedHash.substring(0, 10)}...]`);
      console.log('🔑 Provided signature:', `[${providedSignature.substring(0, 10)}...]`);

      // Comparação segura (timing-safe seria ideal, mas para simplificar)
      if (calculatedHash.toLowerCase() !== providedSignature.toLowerCase()) {
        console.error('❌ SECURITY: Signature mismatch');
        console.error('  Expected:', calculatedHash);
        console.error('  Received:', providedSignature);
        return new Response(
          JSON.stringify({ error: 'Unauthorized', reason: 'Signature validation failed' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ HMAC-SHA1 signature validated successfully');
    } else {
      console.log('⚠️ No webhook token configured - accepting request without validation');
    }

    // ═══════════════════════════════════════════
    // PASSO 4: Agora sim, fazer parse do JSON
    // ═══════════════════════════════════════════
    let payload: KiwifyPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON body');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    // ═══════════════════════════════════════════
    // PROCESSAMENTO DO EVENTO
    // ═══════════════════════════════════════════
    
    // Extrair dados essenciais
    const orderStatus = payload.order_status?.toLowerCase();
    const customerEmail = payload.Customer?.email?.toLowerCase().trim();
    const customerName = payload.Customer?.full_name || 'Cliente';

    console.log('📊 Order Status:', orderStatus);
    console.log('📧 Customer Email:', customerEmail);

    // Validar email
    if (!customerEmail) {
      console.error('❌ Missing customer email');
      return new Response(
        JSON.stringify({ error: 'Missing customer email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Classificar tipo de evento
    const approvalStatuses = ['paid', 'approved'];
    const cancellationStatuses = ['refunded', 'chargedback', 'canceled', 'subscription_canceled'];
    
    const isApproval = approvalStatuses.includes(orderStatus);
    const isCancellation = cancellationStatuses.includes(orderStatus);

    if (!isApproval && !isCancellation) {
      console.log(`ℹ️ Ignoring event with status: ${orderStatus}`);
      return new Response(
        JSON.stringify({ success: true, message: `Event ignored - status: ${orderStatus}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ═══════════════════════════════════════════
    // FLUXO DE CANCELAMENTO
    // ═══════════════════════════════════════════
    if (isCancellation) {
      console.log('🚫 Processing CANCELLATION');
      
      const existingUser = await findUserByEmail(supabase, customerEmail);

      if (existingUser) {
        const { error: updateError } = await supabase.rpc('update_user_plan', {
          target_user_id: existingUser.id,
          new_plan_type: 'free',
          new_status: 'inactive',
        });

        if (updateError) {
          console.error('❌ Error deactivating subscription:', updateError.message);
          throw new Error('Failed to deactivate subscription');
        }

        console.log(`✅ Subscription canceled for ${customerEmail}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            action: 'canceled',
            user_id: existingUser.id,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`ℹ️ User ${customerEmail} not found - ignoring cancellation`);
      return new Response(
        JSON.stringify({ success: true, message: 'User not found - cancellation ignored' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ═══════════════════════════════════════════
    // FLUXO DE APROVAÇÃO (COMPRA)
    // ═══════════════════════════════════════════
    console.log('💰 Processing PURCHASE');

    // Identificar produto
    const product = identifyProduct(payload);

    if (!product) {
      console.error('❌ Unknown product in payload');
      return new Response(
        JSON.stringify({ 
          error: 'Unknown product',
          debug: {
            checkout_link: payload.checkout_link || null,
            product_id: payload.product_id || null,
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determinar plano final
    const newPlan = product.config.billing === 'yearly' 
      ? `${product.config.plan}_yearly` 
      : product.config.plan;

    console.log(`📋 Plan determined: ${newPlan} (from product: ${product.key})`);

    // Buscar usuário
    const existingUser = await findUserByEmail(supabase, customerEmail);

    if (existingUser) {
      // ═══════════════════════════════════════
      // CENÁRIO 1: Upgrade de usuário existente
      // ═══════════════════════════════════════
      console.log(`🔄 Upgrading existing user: ${existingUser.id}`);

      const { error: updateError } = await supabase.rpc('update_user_plan', {
        target_user_id: existingUser.id,
        new_plan_type: newPlan,
        new_status: 'active',
      });

      if (updateError) {
        console.error('❌ Error updating plan:', updateError.message);
        throw new Error('Failed to update user plan');
      }

      // Atualizar kiwify_customer_id se disponível
      if (payload.Subscription?.id) {
        await supabase
          .from('profiles')
          .update({ kiwify_customer_id: payload.Subscription.id })
          .eq('id', existingUser.id);
      }

      console.log(`✅ User ${customerEmail} upgraded to ${newPlan}`);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'upgraded',
          user_id: existingUser.id,
          plan: newPlan,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // ═══════════════════════════════════════
      // CENÁRIO 2: Novo usuário (checkout first)
      // ═══════════════════════════════════════
      console.log(`📝 Creating new user: ${customerEmail}`);

      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        customerEmail,
        {
          data: {
            full_name: customerName,
            plan_type: newPlan,
            accepted_terms: true,
          },
          redirectTo: `${SITE_URL}/auth/update-password`,
        }
      );

      if (inviteError) {
        console.error('❌ Error inviting user:', inviteError.message);
        throw new Error(`Failed to invite user: ${inviteError.message}`);
      }

      const newUserId = inviteData.user?.id;
      console.log(`📧 Invitation sent. New user ID: ${newUserId}`);

      if (newUserId) {
        // Aguardar trigger handle_new_user
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Atualizar plano
        const { error: planError } = await supabase.rpc('update_user_plan', {
          target_user_id: newUserId,
          new_plan_type: newPlan,
          new_status: 'active',
        });

        if (planError) {
          console.error('⚠️ Error setting plan for new user:', planError.message);
          // Não falhar - usuário foi criado
        } else {
          console.log(`✅ New user created with plan ${newPlan}`);
        }

        // Salvar kiwify_customer_id
        if (payload.Subscription?.id) {
          await supabase
            .from('profiles')
            .update({ kiwify_customer_id: payload.Subscription.id })
            .eq('id', newUserId);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: 'invited',
          user_id: newUserId,
          plan: newPlan,
          message: 'Invitation email sent',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('═══════════════════════════════════════════');
    console.error('❌ WEBHOOK ERROR:', errorMessage);
    console.error('═══════════════════════════════════════════');

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
