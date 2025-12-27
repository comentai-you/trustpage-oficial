import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AddDomainRequest {
  domain: string;
}

interface VercelDomainResponse {
  name?: string;
  apexName?: string;
  verified?: boolean;
  error?: {
    code: string;
    message: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user's plan - only Essential and Pro can add domains (not Trial)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, plan_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.subscription_status === 'trial') {
      return new Response(
        JSON.stringify({ error: 'Domínios personalizados não estão disponíveis no plano Trial. Faça upgrade para um plano pago.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { domain }: AddDomainRequest = await req.json();

    if (!domain || typeof domain !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Domínio inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate domain format
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return new Response(
        JSON.stringify({ error: 'Formato de domínio inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Vercel credentials from environment
    const vercelToken = Deno.env.get('VERCEL_API_TOKEN');
    const projectId = Deno.env.get('VERCEL_PROJECT_ID');
    const teamId = Deno.env.get('VERCEL_TEAM_ID');

    if (!vercelToken || !projectId) {
      console.error('Missing Vercel credentials');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Adding domain ${domain} to Vercel project ${projectId}`);

    // Build Vercel API URL
    let vercelUrl = `https://api.vercel.com/v9/projects/${projectId}/domains`;
    if (teamId) {
      vercelUrl += `?teamId=${teamId}`;
    }

    // Call Vercel API to add domain
    const vercelResponse = await fetch(vercelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    const vercelData: VercelDomainResponse = await vercelResponse.json();
    console.log('Vercel response:', JSON.stringify(vercelData));

    if (!vercelResponse.ok) {
      // Handle specific Vercel errors
      let errorMessage = 'Erro ao adicionar domínio na Vercel';
      
      if (vercelData.error) {
        switch (vercelData.error.code) {
          case 'domain_already_in_use':
            errorMessage = 'Este domínio já está em uso por outro projeto. Remova-o do projeto anterior primeiro.';
            break;
          case 'invalid_domain':
            errorMessage = 'Domínio inválido. Verifique se digitou corretamente.';
            break;
          case 'forbidden':
            errorMessage = 'Você não tem permissão para adicionar este domínio.';
            break;
          case 'domain_external':
            errorMessage = 'Este domínio está registrado em outra conta Vercel.';
            break;
          default:
            errorMessage = vercelData.error.message || errorMessage;
        }
      }

      return new Response(
        JSON.stringify({ error: errorMessage, code: vercelData.error?.code }),
        { status: vercelResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success! Save domain to user's profile using service role
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        custom_domain: domain,
        domain_verified: false 
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error saving domain to profile:', updateError);
      // Domain was added to Vercel but we couldn't save it - still return success
      // but log the error for debugging
    }

    console.log(`Domain ${domain} added successfully for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        domain: domain,
        message: 'Domínio adicionado com sucesso! Configure seu DNS conforme as instruções.',
        dnsInstructions: {
          type: 'CNAME',
          name: 'www',
          value: 'cname.vercel-dns.com'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-domain function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
