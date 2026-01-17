import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResolveRequest {
  hostname: string;
  path?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hostname, path }: ResolveRequest = await req.json();

    if (!hostname) {
      return new Response(
        JSON.stringify({ error: 'Hostname é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Resolving custom domain: ${hostname}, path: ${path || '/'}`);

    // Initialize Supabase with service role for public access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize hostname (remove www. prefix if present)
    const normalizedHostname = hostname.toLowerCase().replace(/^www\./, '');

    // STEP 1: Search in user_domains table first (supports multiple domains per user)
    let profile: { id: string; plan_type: string; subscription_status: string } | null = null;

    const { data: userDomain, error: domainError } = await supabase
      .from('user_domains')
      .select('user_id')
      .or(`domain.eq.${normalizedHostname},domain.eq.www.${normalizedHostname}`)
      .eq('verified', true)
      .maybeSingle();

    if (domainError) {
      console.error('Error finding user_domain:', domainError);
    }

    // STEP 2: If found in user_domains, load profile by user_id
    if (userDomain?.user_id) {
      console.log(`Found domain in user_domains for user: ${userDomain.user_id}`);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, plan_type, subscription_status')
        .eq('id', userDomain.user_id)
        .maybeSingle();

      if (profileError) {
        console.error('Error finding profile by user_id:', profileError);
      } else {
        profile = profileData;
      }
    }

    // STEP 3: Fallback - check profiles.custom_domain for backwards compatibility
    if (!profile) {
      console.log(`Domain not found in user_domains, trying profiles.custom_domain fallback...`);
      
      const { data: legacyProfile, error: legacyError } = await supabase
        .from('profiles')
        .select('id, plan_type, subscription_status')
        .or(`custom_domain.eq.${normalizedHostname},custom_domain.eq.www.${normalizedHostname}`)
        .eq('domain_verified', true)
        .maybeSingle();

      if (legacyError) {
        console.error('Error in legacy profile lookup:', legacyError);
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar domínio' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      profile = legacyProfile;
    }

    // No domain found in either table
    if (!profile) {
      console.log(`No verified domain found for: ${normalizedHostname}`);
      return new Response(
        JSON.stringify({ 
          found: false, 
          error: 'Domínio não encontrado ou não verificado' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found profile ${profile.id} for domain ${normalizedHostname}`);

    console.log(`Found profile ${profile.id} for domain ${normalizedHostname}`);

    // Check if subscription is active
    const isActive = profile.subscription_status === 'active' || profile.subscription_status === 'free';
    if (!isActive) {
      return new Response(
        JSON.stringify({ 
          found: false, 
          error: 'Assinatura inativa' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse path to find slug - handle legacy /p/ prefix and clean URLs
    // Examples: /p/oferta-natal -> oferta-natal, /oferta-natal -> oferta-natal
    let pathSlug = path || '';
    
    // Step 1: Remove /p/ prefix if present (legacy route support)
    if (pathSlug.startsWith('/p/')) {
      pathSlug = pathSlug.substring(3);
    }
    
    // Step 2: Remove leading slashes
    pathSlug = pathSlug.replace(/^\/+/, '');
    
    // Step 3: Get only the first segment (before any additional slashes)
    pathSlug = pathSlug.split('/')[0] || '';
    
    console.log(`Extracted slug from path "${path}": "${pathSlug}"`);

    // If path has a slug, find that specific page
    if (pathSlug && pathSlug !== '') {
      const { data: page, error: pageError } = await supabase
        .from('landing_pages')
        .select('id, slug, template_type, page_name, is_published')
        .eq('user_id', profile.id)
        .eq('slug', pathSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (pageError) {
        console.error('Error finding page by slug:', pageError);
      }

      if (page) {
        console.log(`Found page by slug: ${page.slug}`);
        return new Response(
          JSON.stringify({
            found: true,
            type: 'page',
            userId: profile.id,
            pageId: page.id,
            slug: page.slug,
            templateType: page.template_type,
            pageName: page.page_name,
            planType: profile.plan_type
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If no slug or page not found, return the user's published pages for homepage
    const { data: pages, error: pagesError } = await supabase
      .from('landing_pages')
      .select('id, slug, template_type, page_name, is_published, created_at')
      .eq('user_id', profile.id)
      .eq('is_published', true)
      .order('created_at', { ascending: true })
      .limit(10);

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar páginas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pages || pages.length === 0) {
      console.log(`No published pages found for user ${profile.id}`);
      return new Response(
        JSON.stringify({ 
          found: true,
          type: 'no_pages',
          userId: profile.id,
          message: 'Nenhuma página publicada encontrada'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the first page as default homepage, plus list of all pages
    const defaultPage = pages[0];
    console.log(`Returning default page: ${defaultPage.slug}`);

    return new Response(
      JSON.stringify({
        found: true,
        type: 'homepage',
        userId: profile.id,
        defaultPage: {
          id: defaultPage.id,
          slug: defaultPage.slug,
          templateType: defaultPage.template_type,
          pageName: defaultPage.page_name
        },
        pages: pages.map(p => ({
          id: p.id,
          slug: p.slug,
          templateType: p.template_type,
          pageName: p.page_name
        })),
        planType: profile.plan_type
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in resolve-custom-domain function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
