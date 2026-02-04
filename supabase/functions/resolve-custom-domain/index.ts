import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResolveRequest {
  hostname: string;
  path?: string;
}

// System domain for public pages (free plan + cloned pages)
const SYSTEM_DOMAIN = 'tpage.com.br';

// Legal page slugs that need special handling (stored in legal_pages table)
const LEGAL_PAGE_SLUGS = ['politica-de-privacidade', 'termos-de-uso', 'contato'];

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

    console.log(`Resolving domain: ${hostname}, path: ${path || '/'}`);

    // Initialize Supabase with service role for public access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize hostname (remove www. prefix if present)
    const normalizedHostname = hostname.toLowerCase().replace(/^www\./, '');

    // Parse path to find slug - handle /p/, /c/ prefixes and clean URLs
    let pathSlug = path || '';
    let isClonedPagePath = false;
    
    // Check for cloned page prefix /c/
    if (pathSlug.startsWith('/c/')) {
      pathSlug = pathSlug.substring(3);
      isClonedPagePath = true;
    }
    // Check for landing page prefix /p/
    else if (pathSlug.startsWith('/p/')) {
      pathSlug = pathSlug.substring(3);
    }
    
    // Remove leading slashes and get first segment
    pathSlug = pathSlug.replace(/^\/+/, '');
    pathSlug = pathSlug.split('/')[0] || '';
    
    console.log(`Extracted slug: "${pathSlug}", isClonedPagePath: ${isClonedPagePath}`);

    // ===== CASE 1: SYSTEM DOMAIN (tpage.com.br) =====
    // On system domain, we search pages directly by slug (no user filtering)
    if (normalizedHostname === SYSTEM_DOMAIN || normalizedHostname === `www.${SYSTEM_DOMAIN}`) {
      console.log('System domain detected, searching by slug only...');
      
      // Handle cloned pages on system domain
      if (isClonedPagePath && pathSlug) {
        const { data: clonedPage, error: clonedError } = await supabase
          .from('cloned_pages')
          .select('id, slug, page_name, is_published, user_id')
          .eq('slug', pathSlug)
          .eq('is_published', true)
          .maybeSingle();

        if (clonedError) {
          console.error('Error finding cloned page:', clonedError);
        }

        if (clonedPage) {
          console.log(`Found cloned page: ${clonedPage.slug}`);
          return new Response(
            JSON.stringify({
              found: true,
              type: 'cloned_page',
              userId: clonedPage.user_id,
              pageId: clonedPage.id,
              slug: clonedPage.slug,
              pageName: clonedPage.page_name
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ found: false, error: 'Página clonada não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle landing pages on system domain (search by slug only)
      if (pathSlug) {
        const { data: page, error: pageError } = await supabase
          .from('landing_pages')
          .select('id, slug, template_type, page_name, is_published, user_id')
          .eq('slug', pathSlug)
          .eq('is_published', true)
          .maybeSingle();

        if (pageError) {
          console.error('Error finding page by slug:', pageError);
        }

        if (page) {
          console.log(`Found landing page: ${page.slug}`);
          return new Response(
            JSON.stringify({
              found: true,
              type: 'page',
              userId: page.user_id,
              pageId: page.id,
              slug: page.slug,
              templateType: page.template_type,
              pageName: page.page_name
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fallback: try cloned page without /c/ prefix
        const { data: clonedFallback } = await supabase
          .from('cloned_pages')
          .select('id, slug, page_name, is_published, user_id')
          .eq('slug', pathSlug)
          .eq('is_published', true)
          .maybeSingle();

        if (clonedFallback) {
          console.log(`Found cloned page (fallback): ${clonedFallback.slug}`);
          return new Response(
            JSON.stringify({
              found: true,
              type: 'cloned_page',
              userId: clonedFallback.user_id,
              pageId: clonedFallback.id,
              slug: clonedFallback.slug,
              pageName: clonedFallback.page_name
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ found: false, error: 'Página não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== CASE 2: CUSTOM DOMAIN =====
    // For custom domains, we need to find the user first, then their pages
    console.log(`Custom domain detected: ${normalizedHostname}`);

    let profile: { id: string; plan_type: string; subscription_status: string } | null = null;

    // Step 1: Search in user_domains table (supports multiple domains per user)
    const { data: userDomain, error: domainError } = await supabase
      .from('user_domains')
      .select('user_id')
      .or(`domain.eq.${normalizedHostname},domain.eq.www.${normalizedHostname}`)
      .eq('verified', true)
      .maybeSingle();

    if (domainError) {
      console.error('Error finding user_domain:', domainError);
    }

    // Step 2: If found in user_domains, load profile by user_id
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

    // Step 3: Fallback - check profiles.custom_domain for backwards compatibility
    if (!profile) {
      console.log('Trying profiles.custom_domain fallback...');
      
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

    // ===== RESOLVE PAGE FOR CUSTOM DOMAIN =====
    
    // Handle cloned pages
    if (isClonedPagePath && pathSlug) {
      const { data: clonedPage, error: clonedError } = await supabase
        .from('cloned_pages')
        .select('id, slug, page_name, is_published')
        .eq('user_id', profile.id)
        .eq('slug', pathSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (clonedError) {
        console.error('Error finding cloned page:', clonedError);
      }

      if (clonedPage) {
        console.log(`Found cloned page: ${clonedPage.slug}`);
        return new Response(
          JSON.stringify({
            found: true,
            type: 'cloned_page',
            userId: profile.id,
            pageId: clonedPage.id,
            slug: clonedPage.slug,
            pageName: clonedPage.page_name,
            planType: profile.plan_type
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle landing pages with slug
    if (pathSlug) {
      // Check if it's a legal page slug - these are stored in legal_pages table
      const isLegalSlug = LEGAL_PAGE_SLUGS.includes(pathSlug.toLowerCase());
      
      if (isLegalSlug) {
        console.log(`Legal page slug detected: ${pathSlug}, checking legal_pages table...`);
        
        const { data: legalPage, error: legalError } = await supabase
          .from('legal_pages')
          .select('id, slug, title, is_published')
          .eq('user_id', profile.id)
          .eq('slug', pathSlug.toLowerCase())
          .eq('is_published', true)
          .maybeSingle();

        if (legalError) {
          console.error('Error finding legal page:', legalError);
        }

        if (legalPage) {
          console.log(`Found legal page: ${legalPage.slug}`);
          return new Response(
            JSON.stringify({
              found: true,
              type: 'legal_page',
              userId: profile.id,
              pageId: legalPage.id,
              slug: legalPage.slug,
              pageName: legalPage.title,
              planType: profile.plan_type
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Legal page not found for this user
        console.log(`Legal page ${pathSlug} not found for user ${profile.id}`);
        return new Response(
          JSON.stringify({ found: false, error: 'Página legal não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Regular landing page lookup
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
        console.log(`Found landing page: ${page.slug}`);
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

      // Fallback: try cloned page without /c/ prefix
      if (!isClonedPagePath) {
        const { data: clonedPage } = await supabase
          .from('cloned_pages')
          .select('id, slug, page_name, is_published')
          .eq('user_id', profile.id)
          .eq('slug', pathSlug)
          .eq('is_published', true)
          .maybeSingle();

        if (clonedPage) {
          console.log(`Found cloned page (fallback): ${clonedPage.slug}`);
          return new Response(
            JSON.stringify({
              found: true,
              type: 'cloned_page',
              userId: profile.id,
              pageId: clonedPage.id,
              slug: clonedPage.slug,
              pageName: clonedPage.page_name,
              planType: profile.plan_type
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Legal page slugs that should NOT be the default homepage
    const LEGAL_SLUGS = ['politica-de-privacidade', 'termos-de-uso', 'contato'];

    // No slug provided - return homepage (first non-legal published page)
    const { data: pages, error: pagesError } = await supabase
      .from('landing_pages')
      .select('id, slug, template_type, page_name, is_published, created_at')
      .eq('user_id', profile.id)
      .eq('is_published', true)
      .order('created_at', { ascending: true })
      .limit(20);

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

    // Filter out legal pages for default homepage selection
    const nonLegalPages = pages.filter(p => !LEGAL_SLUGS.includes(p.slug.toLowerCase()));
    
    // Use first non-legal page as default, or first page if only legal pages exist
    const defaultPage = nonLegalPages.length > 0 ? nonLegalPages[0] : pages[0];
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
