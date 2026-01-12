import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RemoveDomainRequest {
  domain?: string;
  domainId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body to get domain or domainId
    let domainToRemove: string | null = null;
    let domainId: string | null = null;

    try {
      const body: RemoveDomainRequest = await req.json();
      domainToRemove = body?.domain || null;
      domainId = body?.domainId || null;
    } catch {
      // If no body, we'll look for the primary domain
    }

    // Get domain from user_domains table
    let domainRecord: { id: string; domain: string; is_primary: boolean } | null = null;

    if (domainId) {
      // Get by ID
      const { data, error } = await supabase
        .from('user_domains')
        .select('id, domain, is_primary')
        .eq('id', domainId)
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        domainRecord = data;
      }
    } else if (domainToRemove) {
      // Get by domain name
      const { data, error } = await supabase
        .from('user_domains')
        .select('id, domain, is_primary')
        .eq('domain', domainToRemove.toLowerCase())
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        domainRecord = data;
      }
    } else {
      // Get primary domain (for backwards compatibility)
      const { data, error } = await supabase
        .from('user_domains')
        .select('id, domain, is_primary')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();
      
      if (!error && data) {
        domainRecord = data;
      }
    }

    if (!domainRecord) {
      return new Response(
        JSON.stringify({ error: 'Nenhum domínio encontrado para remover' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const domain = domainRecord.domain;

    // Get Vercel credentials
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

    console.log(`Removing domain ${domain} from Vercel project ${projectId}`);

    // Build Vercel API URL for DELETE
    let vercelUrl = `https://api.vercel.com/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`;
    if (teamId) {
      vercelUrl += `?teamId=${encodeURIComponent(teamId)}`;
    }

    // Call Vercel API to remove domain
    const vercelResponse = await fetch(vercelUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Vercel returns 204 on success, or 200 with body
    if (!vercelResponse.ok && vercelResponse.status !== 204) {
      const vercelData = await vercelResponse.json().catch(() => ({}));
      console.error('Vercel remove error:', vercelData);
      
      // Even if Vercel fails (e.g., domain not found), we still delete from our DB
      console.log('Proceeding to delete from database despite Vercel error');
    }

    // Delete from user_domains table using service role
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error: deleteError } = await supabaseAdmin
      .from('user_domains')
      .delete()
      .eq('id', domainRecord.id);

    if (deleteError) {
      console.error('Error deleting domain from user_domains:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Erro ao remover domínio do banco de dados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If this was the primary domain, update the next domain as primary or clear profiles
    if (domainRecord.is_primary) {
      // Check if there are other domains
      const { data: remainingDomains } = await supabaseAdmin
        .from('user_domains')
        .select('id, domain')
        .eq('user_id', user.id)
        .limit(1);

      if (remainingDomains && remainingDomains.length > 0) {
        // Make the next domain primary
        await supabaseAdmin
          .from('user_domains')
          .update({ is_primary: true })
          .eq('id', remainingDomains[0].id);

        // Update profiles with new primary domain
        await supabaseAdmin
          .from('profiles')
          .update({ 
            custom_domain: remainingDomains[0].domain,
            domain_verified: false 
          })
          .eq('id', user.id);
      } else {
        // No domains left, clear profiles
        await supabaseAdmin
          .from('profiles')
          .update({ 
            custom_domain: null,
            domain_verified: false 
          })
          .eq('id', user.id);
      }
    }

    console.log(`Domain ${domain} removed successfully for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Domínio removido com sucesso!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in remove-domain function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
