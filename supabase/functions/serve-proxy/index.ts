import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface ReplacedLink {
  original: string;
  new: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      console.log('[serve-proxy] No slug provided');
      return new Response(
        JSON.stringify({ error: 'Slug not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[serve-proxy] Serving page with slug: ${slug}`);

    // 1. Get page config from database using SERVICE_ROLE_KEY to bypass RLS
    // This ensures we can always read published pages regardless of auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[serve-proxy] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: page, error: dbError } = await supabase
      .from('cloned_pages')
      .select('source_url, links, head_code, is_published')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();
    
    console.log(`[serve-proxy] DB query result - page: ${page ? 'found' : 'null'}, error: ${dbError?.message || 'none'}`);

    if (dbError) {
      console.error('[serve-proxy] Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Database error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!page) {
      console.log('[serve-proxy] Page not found or not published');
      return new Response(
        JSON.stringify({ error: 'Page not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[serve-proxy] Fetching source: ${page.source_url}`);

    // 2. Fetch the original site in real-time (Tunneling/Reverse Proxy)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(page.source_url, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[serve-proxy] Fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Timeout - site demorou muito para responder' }), 
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao acessar o site original' }), 
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check content type - pass through non-HTML assets directly
    const contentType = response.headers.get('content-type') || '';
    
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      // Stream non-HTML content directly (CSS, JS, images, etc.)
      console.log(`[serve-proxy] Passing through non-HTML content: ${contentType}`);
      
      const newHeaders = new Headers();
      response.headers.forEach((value, key) => {
        // Copy most headers but remove security-related ones
        const lowerKey = key.toLowerCase();
        if (!['x-frame-options', 'content-security-policy', 'x-content-type-options'].includes(lowerKey)) {
          newHeaders.set(key, value);
        }
      });
      
      // Add CORS and allow framing
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    }

    // 4. Process HTML content
    let html = await response.text();
    const targetOrigin = new URL(page.source_url).origin;

    console.log(`[serve-proxy] Processing HTML (${html.length} bytes) from ${targetOrigin}`);

    // A. Remove existing base tags to avoid conflicts
    html = html.replace(/<base[^>]*>/gi, '');
    
    // B. Inject base tag (CRITICAL - fixes all relative assets instantly)
    const baseTag = `<base href="${targetOrigin}/" target="_self">`;
    if (html.toLowerCase().includes('<head>')) {
      html = html.replace(/<head>/i, `<head>\n${baseTag}`);
    } else if (html.toLowerCase().includes('<html>')) {
      html = html.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${baseTag}</head>`);
    } else {
      html = `<head>${baseTag}</head>\n${html}`;
    }

    // C. Swap links (checkout/affiliate links replacement)
    // links is a JSONB array: [{ text, href, selector, newHref }]
    if (page.links && Array.isArray(page.links)) {
      const linksData = page.links as Array<{ href: string; newHref?: string }>;
      
      linksData.forEach((link) => {
        if (link.href && link.newHref && link.href !== link.newHref) {
          // Global string replace for the link
          const escapedHref = link.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          // Replace in href attributes
          html = html.replace(new RegExp(`(href=["'])${escapedHref}(["'])`, 'gi'), `$1${link.newHref}$2`);
          html = html.replace(new RegExp(`(href=)${escapedHref}([\\s>])`, 'gi'), `$1${link.newHref}$2`);
          
          // Also replace any onclick or data attributes that might contain the URL
          html = html.split(link.href).join(link.newHref);
        }
      });
      
      console.log(`[serve-proxy] Replaced ${linksData.filter(l => l.newHref && l.href !== l.newHref).length} links`);
    }

    // D. Inject custom head scripts (Pixel, GTM, etc.)
    if (page.head_code && page.head_code.trim()) {
      if (html.toLowerCase().includes('</head>')) {
        html = html.replace(/<\/head>/i, `${page.head_code}\n</head>`);
      } else {
        html = `${html}\n${page.head_code}`;
      }
      console.log('[serve-proxy] Injected custom head code');
    }

    // E. Remove tracking scripts from original page (optional security/privacy measure)
    html = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
      const lowerMatch = match.toLowerCase();
      if (lowerMatch.includes('google-analytics') || 
          lowerMatch.includes('gtag') ||
          lowerMatch.includes('fbq') ||
          lowerMatch.includes('facebook.net') ||
          lowerMatch.includes('hotjar') ||
          lowerMatch.includes('clarity.ms')) {
        return '<!-- tracking script removed -->';
      }
      return match;
    });

    console.log(`[serve-proxy] Returning modified HTML (${html.length} bytes)`);

    // 5. Return modified HTML with permissive headers
    // CRITICAL: Headers must tell browser this is HTML to render, not text to display
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL', // Allow embedding in iframes
        'Access-Control-Allow-Origin': '*', // CORS for preview
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (err) {
    console.error('[serve-proxy] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
