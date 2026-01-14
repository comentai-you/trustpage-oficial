import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-signature, x-webhook-token',
};

// Mapeamento de produtos Kiwify para planos
// IMPORTANTE: A chave deve ser o checkout_link ou product_id que a Kiwify envia
const PRODUCTS: Record<string, { plan: string; billing: string }> = {
  // Checkout Links (identificador curto da Kiwify)
  'P7MaOJK': { plan: 'essential', billing: 'monthly' },
  'f0lsmRn': { plan: 'pro', billing: 'monthly' },
  'f8Tg6DT': { plan: 'essential', billing: 'yearly' },
  'TQlihDk': { plan: 'pro', billing: 'yearly' },
};

const SITE_URL = 'https://trustpageapp.com';

interface KiwifyPayload {
  order_id: string;
  order_status: string;
  product_id: string;
  product_name: string;
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookToken = Deno.env.get('KIWIFY_WEBHOOK_TOKEN');

    console.log('=== WEBHOOK REQUEST RECEIVED ===');
    console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));

    // Parse payload first to get signature from body if needed
    const payload: KiwifyPayload = await req.json();
    console.log('Full Payload:', JSON.stringify(payload, null, 2));

    // Tentar obter token de várias fontes (Kiwify pode enviar de formas diferentes)
    const signatureFromHeader = req.headers.get('x-kiwify-signature') || 
                                 req.headers.get('authorization') ||
                                 req.headers.get('x-webhook-token');
    const signatureFromBody = (payload as any).signature || (payload as any).webhook_token;
    const signature = signatureFromHeader || signatureFromBody;

    // SECURITY: Validar token se configurado
    if (webhookToken) {
      if (!signature) {
        console.warn('⚠️ No signature provided, but KIWIFY_WEBHOOK_TOKEN is configured');
        console.warn('Proceeding anyway - configure token validation in Kiwify dashboard');
        // Continuar mesmo sem assinatura para não bloquear vendas
        // A Kiwify pode não estar enviando o header corretamente
      } else {
        const providedToken = signature.replace('Bearer ', '');
        if (providedToken !== webhookToken) {
          console.error('❌ Invalid webhook signature provided');
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('✅ Webhook signature validated');
      }
    } else {
      console.warn('⚠️ KIWIFY_WEBHOOK_TOKEN not configured - accepting all requests');
    }
    
    console.log('=== KIWIFY WEBHOOK RECEIVED ===');
    console.log('Order ID:', payload.order_id);
    console.log('Order Status:', payload.order_status);
    console.log('Product ID:', payload.product_id);
    console.log('Customer Email:', payload.Customer?.email);

    // Status de aprovação (venda confirmada)
    const approvalStatuses = ['paid', 'approved'];
    const isApproved = approvalStatuses.includes(payload.order_status);
    
    // Status de cancelamento
    const cancellationStatuses = ['refunded', 'chargedback', 'canceled', 'subscription_canceled'];
    const isCancellation = cancellationStatuses.includes(payload.order_status);
    
    // Ignorar eventos que não são nem aprovação nem cancelamento
    if (!isApproved && !isCancellation) {
      console.log(`Ignoring event with status: ${payload.order_status}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored - not a purchase or cancellation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar email (obrigatório para ambos os fluxos)
    const customerEmail = payload.Customer?.email?.toLowerCase().trim();
    
    if (!customerEmail) {
      console.error('Missing customer email');
      return new Response(
        JSON.stringify({ error: 'Missing customer email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase com service role (necessário para ambos os fluxos)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ========== FLUXO DE CANCELAMENTO ==========
    if (isCancellation) {
      console.log(`=== PROCESSING CANCELLATION for ${customerEmail} ===`);
      
      // Buscar usuário por email usando paginação
      let existingUser = null;
      let page = 1;
      const perPage = 50;
      
      while (true) {
        const { data: usersPage, error: pageError } = await supabase.auth.admin.listUsers({
          page,
          perPage,
        });
        
        if (pageError) {
          console.error('Error listing users:', pageError.message);
          throw new Error('Failed to check existing users');
        }
        
        if (!usersPage?.users || usersPage.users.length === 0) {
          break;
        }
        
        const userInPage = usersPage.users.find(
          (u) => u.email?.toLowerCase() === customerEmail
        );
        
        if (userInPage) {
          existingUser = userInPage;
          break;
        }
        
        if (usersPage.users.length < perPage) {
          break;
        }
        
        page++;
        if (page > 200) {
          console.warn('Reached max pagination limit');
          break;
        }
      }
      
      if (existingUser) {
        // Desativar assinatura do usuário
        const { error: updateError } = await supabase.rpc('update_user_plan', {
          target_user_id: existingUser.id,
          new_plan_type: 'free',
          new_status: 'inactive',
        });
        
        if (updateError) {
          console.error('Error deactivating subscription:', updateError.message);
          throw new Error('Failed to deactivate subscription');
        }
        
        console.log(`✅ Subscription canceled for ${customerEmail}. Plan set to free/inactive.`);
        
        return new Response(
          JSON.stringify({
            success: true,
            action: 'canceled',
            user_id: existingUser.id,
            message: 'Subscription deactivated',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log(`User ${customerEmail} not found for cancellation. Ignoring.`);
        return new Response(
          JSON.stringify({ success: true, message: 'User not found - cancellation ignored' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ========== FLUXO DE VENDA (APROVAÇÃO) ==========
    // Só executa se isApproved === true
    const customerName = payload.Customer?.full_name || 'Cliente';
    
    // Extração robusta do product_id (Kiwify envia em payload.Product.product_id)
    const productId = (payload as any).product_id || 
                      (payload as any).Product_ID || 
                      ((payload as any).Product && (payload as any).Product.product_id) ||
                      ((payload as any).product && (payload as any).product.id);
    
    // Fallback: usar checkout_link como identificador do produto (mapeado em PRODUCTS)
    const checkoutLink = (payload as any).checkout_link;
    
    // O productId pode ser um UUID, mas o PRODUCTS usa checkout_link como chave
    // Priorizar checkout_link para mapear o plano
    const productKey = checkoutLink && PRODUCTS[checkoutLink] ? checkoutLink : productId;

    // Verificar se temos uma forma de identificar o produto
    if (!productKey && !checkoutLink) {
      console.error('Missing product identification in payload:', JSON.stringify(payload));
      return new Response(
        JSON.stringify({ error: 'Missing product_id or checkout_link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mapear produto para plano usando productKey (checkout_link tem prioridade)
    const productConfig = PRODUCTS[productKey] || PRODUCTS[checkoutLink];
    if (!productConfig) {
      console.error(`Unknown product key: ${productKey}, checkout_link: ${checkoutLink}`);
      return new Response(
        JSON.stringify({ error: `Unknown product: ${productKey || checkoutLink}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determinar o plan_type com sufixo para planos anuais
    const newPlan = productConfig.billing === 'yearly' 
      ? `${productConfig.plan}_yearly` 
      : productConfig.plan;
    console.log(`Product mapped to plan: ${newPlan} (billing: ${productConfig.billing}) - key: ${productKey}, checkout_link: ${checkoutLink}`);

    // CENÁRIO: Verificar se usuário existe (busca filtrada para performance)
    console.log(`Checking if user exists with email: ${customerEmail}`);
    
    let existingUser = null;
    
    // Buscar usuário por email de forma paginada para evitar problemas de performance
    // A API do Supabase Auth Admin não suporta filtro direto por email, então fazemos busca incremental
    let page = 1;
    const perPage = 50;
    let foundUser = false;
    
    while (!foundUser) {
      const { data: usersPage, error: pageError } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });
      
      if (pageError) {
        console.error('Error listing users:', pageError.message);
        throw new Error('Failed to check existing users');
      }
      
      // Se não há mais usuários, sair do loop
      if (!usersPage?.users || usersPage.users.length === 0) {
        break;
      }
      
      // Procurar o usuário nesta página
      const userInPage = usersPage.users.find(
        (u) => u.email?.toLowerCase() === customerEmail
      );
      
      if (userInPage) {
        existingUser = userInPage;
        foundUser = true;
        break;
      }
      
      // Se recebemos menos usuários que o perPage, é a última página
      if (usersPage.users.length < perPage) {
        break;
      }
      
      page++;
      
      // Limite de segurança para evitar loops infinitos (max 10000 usuários)
      if (page > 200) {
        console.warn('Reached max pagination limit (10000 users)');
        break;
      }
    }

    if (existingUser) {
      // CENÁRIO 1: Usuário EXISTE - Upgrade/Renovação
      console.log(`User found: ${existingUser.id}. Upgrading to plan: ${newPlan}`);

      // Atualizar profile usando a função de segurança
      const { data: updateResult, error: updateError } = await supabase.rpc('update_user_plan', {
        target_user_id: existingUser.id,
        new_plan_type: newPlan,
        new_status: 'active',
      });

      if (updateError) {
        console.error('Error updating plan:', updateError.message);
        throw new Error('Failed to update user plan');
      }

      // Atualizar kiwify_customer_id se tivermos subscription ID
      if (payload.Subscription?.id) {
        await supabase
          .from('profiles')
          .update({ kiwify_customer_id: payload.Subscription.id })
          .eq('id', existingUser.id);
      }

      console.log(`✅ User ${customerEmail} upgraded to ${newPlan} successfully`);

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
      // CENÁRIO 2: Usuário NÃO EXISTE - Checkout First
      console.log(`User not found. Creating new user with email: ${customerEmail}`);

      // Criar usuário via invite (envia email com link para definir senha)
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
        console.error('Error inviting user:', inviteError.message);
        throw new Error(`Failed to invite user: ${inviteError.message}`);
      }

      const newUserId = inviteData.user?.id;
      console.log(`📧 Invitation sent to ${customerEmail}. New user ID: ${newUserId}`);

      // Aguardar um momento para o trigger criar o profile, depois atualizar o plano
      if (newUserId) {
        // Pequeno delay para garantir que o trigger handle_new_user executou
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Atualizar o plano do novo usuário
        const { error: planError } = await supabase.rpc('update_user_plan', {
          target_user_id: newUserId,
          new_plan_type: newPlan,
          new_status: 'active',
        });

        if (planError) {
          console.error('Error setting plan for new user:', planError.message);
          // Não falhar aqui, o usuário foi criado
        } else {
          console.log(`✅ New user ${customerEmail} created with plan ${newPlan}`);
        }

        // Salvar kiwify_customer_id se disponível
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
          message: 'Invitation email sent to customer',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Webhook error:', errorMessage);

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
