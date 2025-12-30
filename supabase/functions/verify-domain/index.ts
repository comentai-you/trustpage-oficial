import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyDomainRequest {
  domain?: string;
}

type VercelVerificationRecord = {
  type: string;
  domain: string;
  value: string;
  reason?: string;
};

interface VercelProjectDomainResponse {
  name?: string;
  apexName?: string;
  verified?: boolean;
  misconfigured?: boolean;
  verification?: VercelVerificationRecord[];
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, plan_type, custom_domain')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return new Response(JSON.stringify({ error: 'Perfil não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (
      profile.subscription_status === 'trial' ||
      profile.subscription_status === 'free' ||
      profile.plan_type === 'free'
    ) {
      return new Response(
        JSON.stringify({
          error: 'Verificação de domínio não está disponível no seu plano. Faça upgrade para um plano pago.',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    let requestedDomain: string | undefined;
    try {
      const body: VerifyDomainRequest = await req.json();
      requestedDomain = body?.domain;
    } catch {
      // body optional
    }

    const domain = (requestedDomain || profile.custom_domain || '').trim().toLowerCase();

    if (!domain) {
      return new Response(JSON.stringify({ error: 'Nenhum domínio para verificar' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vercelToken = Deno.env.get('VERCEL_API_TOKEN');
    const projectId = Deno.env.get('VERCEL_PROJECT_ID');
    const teamId = Deno.env.get('VERCEL_TEAM_ID');

    if (!vercelToken || !projectId) {
      console.error('Missing Vercel credentials');
      return new Response(JSON.stringify({ error: 'Configuração do servidor incompleta' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let vercelUrl = `https://api.vercel.com/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}/verify`;
    if (teamId) {
      vercelUrl += `?teamId=${encodeURIComponent(teamId)}`;
    }

    console.log(`Verifying domain ${domain} on Vercel project ${projectId}`);

    const vercelResponse = await fetch(vercelUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
    });

    const vercelData: VercelProjectDomainResponse = await vercelResponse.json();
    console.log('Vercel verify response:', JSON.stringify(vercelData));

    if (!vercelResponse.ok) {
      let errorMessage = 'Erro ao verificar domínio na Vercel';

      if (vercelData.error) {
        switch (vercelData.error.code) {
          case 'not_found':
            errorMessage = 'Domínio não encontrado no projeto. Conecte o domínio novamente.';
            break;
          case 'forbidden':
            errorMessage = 'Sem permissão para verificar este domínio.';
            break;
          default:
            errorMessage = vercelData.error.message || errorMessage;
        }
      }

      return new Response(JSON.stringify({ error: errorMessage, code: vercelData.error?.code }), {
        status: vercelResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const verified = !!vercelData.verified;

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ domain_verified: verified })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating domain_verified:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        verified,
        misconfigured: vercelData.misconfigured ?? null,
        verification: vercelData.verification ?? null,
        checkedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in verify-domain function:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
