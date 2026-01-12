import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyDomainRequest {
  domain?: string;
  domainId?: string;
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

// Get domain details (includes SSL status)
interface VercelDomainDetailsResponse {
  name?: string;
  verified?: boolean;
  gitBranch?: string;
  redirect?: string;
  redirectStatusCode?: number;
  certs?: Array<{
    id: string;
    autoRenew: boolean;
    cns: string[];
    createdAt: number;
    expiresAt: number;
  }>;
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
      .select('subscription_status, plan_type')
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
    let requestedDomainId: string | undefined;
    try {
      const body: VerifyDomainRequest = await req.json();
      requestedDomain = body?.domain;
      requestedDomainId = body?.domainId;
    } catch {
      // body optional
    }

    // Get domain from user_domains table
    let domainRecord: { id: string; domain: string; is_primary: boolean } | null = null;

    if (requestedDomainId) {
      const { data } = await supabase
        .from('user_domains')
        .select('id, domain, is_primary')
        .eq('id', requestedDomainId)
        .eq('user_id', user.id)
        .single();
      domainRecord = data;
    } else if (requestedDomain) {
      const { data } = await supabase
        .from('user_domains')
        .select('id, domain, is_primary')
        .eq('domain', requestedDomain.toLowerCase())
        .eq('user_id', user.id)
        .single();
      domainRecord = data;
    } else {
      // Get primary domain
      const { data } = await supabase
        .from('user_domains')
        .select('id, domain, is_primary')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();
      domainRecord = data;
    }

    if (!domainRecord) {
      return new Response(JSON.stringify({ error: 'Nenhum domínio para verificar' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const domain = domainRecord.domain;

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

    // First, verify the domain
    let verifyUrl = `https://api.vercel.com/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}/verify`;
    if (teamId) {
      verifyUrl += `?teamId=${encodeURIComponent(teamId)}`;
    }

    console.log(`Verifying domain ${domain} on Vercel project ${projectId}`);

    const vercelResponse = await fetch(verifyUrl, {
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

    // Now get domain details for SSL info
    let sslStatus: 'pending' | 'active' | 'error' | null = null;
    let sslExpiresAt: string | null = null;

    if (verified) {
      try {
        let detailsUrl = `https://api.vercel.com/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`;
        if (teamId) {
          detailsUrl += `?teamId=${encodeURIComponent(teamId)}`;
        }

        const detailsResponse = await fetch(detailsUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (detailsResponse.ok) {
          const detailsData: VercelDomainDetailsResponse = await detailsResponse.json();
          console.log('Vercel domain details:', JSON.stringify(detailsData));

          if (detailsData.certs && detailsData.certs.length > 0) {
            sslStatus = 'active';
            // Get the latest cert expiry
            const latestCert = detailsData.certs.reduce((latest, cert) => 
              cert.expiresAt > (latest?.expiresAt || 0) ? cert : latest
            , detailsData.certs[0]);
            sslExpiresAt = new Date(latestCert.expiresAt).toISOString();
          } else {
            sslStatus = 'pending';
          }
        }
      } catch (sslError) {
        console.error('Error fetching SSL details:', sslError);
        // Don't fail the whole request, just don't include SSL info
      }
    }

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Update user_domains table
    const { error: updateDomainError } = await supabaseAdmin
      .from('user_domains')
      .update({ verified })
      .eq('id', domainRecord.id);

    if (updateDomainError) {
      console.error('Error updating user_domains verified status:', updateDomainError);
    }

    // Also update profiles for backwards compatibility (if this is the primary domain)
    if (domainRecord.is_primary) {
      await supabaseAdmin
        .from('profiles')
        .update({ domain_verified: verified })
        .eq('id', user.id);
    }

    // Determine if this is a subdomain
    const parts = domain.split('.');
    const isSubdomain = parts.length > 2 || (parts.length === 2 && parts[0] !== 'www');
    const isApex = parts.length === 2;

    // Generate appropriate DNS instructions
    const dnsInstructions = isSubdomain 
      ? {
          type: 'CNAME',
          name: parts.slice(0, -2).join('.') || parts[0], // e.g., "app" for app.example.com
          value: 'cname.vercel-dns.com',
          note: 'Para subdomínios, use CNAME apontando para cname.vercel-dns.com'
        }
      : {
          type: 'A',
          name: '@',
          value: '76.76.21.21',
          note: 'Para domínio raiz, use registro A. Para www, adicione também um CNAME.'
        };

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        domainId: domainRecord.id,
        verified,
        misconfigured: vercelData.misconfigured ?? null,
        verification: vercelData.verification ?? null,
        checkedAt: new Date().toISOString(),
        isSubdomain,
        isApex,
        dnsInstructions,
        ssl: sslStatus ? {
          status: sslStatus,
          expiresAt: sslExpiresAt,
        } : null,
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
