import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-signature',
};

// Mapeamento de produtos Kiwify para planos
const PRODUCTS: Record<string, { plan: string; billing: string }> = {
  'P7MaOJK': { plan: 'essential', billing: 'monthly' },  // ESSENTIAL_MONTHLY
  'ODBfbnA': { plan: 'pro', billing: 'monthly' },        // PRO_MONTHLY
  'f8Tg6DT': { plan: 'essential', billing: 'yearly' },   // ESSENTIAL_YEARLY
  'TQlihDk': { plan: 'pro', billing: 'yearly' },         // PRO_YEARLY
};

const SITE_URL = 'https://trustpage.com.br';

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

    // Validar token do webhook (opcional mas recomendado)
    const signature = req.headers.get('x-kiwify-signature') || req.headers.get('authorization');
    
    if (webhookToken && signature) {
      // Se o token foi configurado, validar
      const providedToken = signature.replace('Bearer ', '');
      if (providedToken !== webhookToken) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const payload: KiwifyPayload = await req.json();
    
    console.log('=== KIWIFY WEBHOOK RECEIVED ===');
    console.log('Order ID:', payload.order_id);
    console.log('Order Status:', payload.order_status);
    console.log('Product ID:', payload.product_id);
    console.log('Customer Email:', payload.Customer?.email);

    // Apenas processar eventos de aprovação
    if (payload.order_status !== 'paid' && payload.order_status !== 'approved') {
      console.log(`Ignoring event with status: ${payload.order_status}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored - not a purchase confirmation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar dados obrigatórios
    const customerEmail = payload.Customer?.email?.toLowerCase().trim();
    const customerName = payload.Customer?.full_name || 'Cliente';
    const productId = payload.product_id;

    if (!customerEmail) {
      console.error('Missing customer email');
      return new Response(
        JSON.stringify({ error: 'Missing customer email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mapear produto para plano
    const productConfig = PRODUCTS[productId];
    if (!productConfig) {
      console.error(`Unknown product ID: ${productId}`);
      return new Response(
        JSON.stringify({ error: `Unknown product ID: ${productId}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newPlan = productConfig.plan;
    console.log(`Product ${productId} mapped to plan: ${newPlan} (${productConfig.billing})`);

    // Criar cliente Supabase com service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // CENÁRIO: Verificar se usuário existe
    console.log(`Checking if user exists with email: ${customerEmail}`);
    
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError.message);
      throw new Error('Failed to check existing users');
    }

    const existingUser = existingUsers.users.find(
      (u) => u.email?.toLowerCase() === customerEmail
    );

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
