import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// User agent moderno para evitar bloqueios simples
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Regex patterns para reescrever assets
const SRC_PATTERN = /(src|href|action|poster)=["'](?!data:|javascript:|#|mailto:|tel:)(\/[^"']*|(?!https?:\/\/)[^"']*)/gi;
const SRCSET_PATTERN = /srcset=["']([^"']+)["']/gi;
const URL_CSS_PATTERN = /url\(["']?(?!data:|#)(\/[^)"']+|(?!https?:\/\/)[^)"']+)["']?\)/gi;
const STYLE_URL_PATTERN = /@import\s+["'](?!data:|#)(\/[^"']+|(?!https?:\/\/)[^"']+)["']/gi;

// Lista de domínios problemáticos conhecidos
const BLOCKED_DOMAINS = [
  'facebook.com',
  'fb.com',
  'google.com',
  'youtube.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'linkedin.com',
  'tiktok.com',
  'amazon.com',
  'apple.com',
  'microsoft.com',
];

function isBlockedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return BLOCKED_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

function makeAbsoluteUrl(relativePath: string, baseUrl: URL): string {
  try {
    // Se já é absoluto, retorna como está (convertendo http para https)
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath.replace(/^http:\/\//, 'https://');
    }
    
    // Construir URL absoluta
    const absolute = new URL(relativePath, baseUrl);
    // Forçar HTTPS para evitar mixed content
    absolute.protocol = 'https:';
    return absolute.href;
  } catch {
    return relativePath;
  }
}

function rewriteHtml(html: string, baseUrl: URL): string {
  let result = html;
  
  // 1. Reescrever src, href, action, poster
  result = result.replace(SRC_PATTERN, (match, attr, path) => {
    const absoluteUrl = makeAbsoluteUrl(path, baseUrl);
    return `${attr}="${absoluteUrl}`;
  });
  
  // 2. Reescrever srcset (imagens responsivas)
  result = result.replace(SRCSET_PATTERN, (match, srcsetValue) => {
    const rewrittenSrcset = srcsetValue
      .split(',')
      .map((entry: string) => {
        const parts = entry.trim().split(/\s+/);
        if (parts.length >= 1) {
          parts[0] = makeAbsoluteUrl(parts[0], baseUrl);
        }
        return parts.join(' ');
      })
      .join(', ');
    return `srcset="${rewrittenSrcset}"`;
  });
  
  // 3. Reescrever url() em CSS inline
  result = result.replace(URL_CSS_PATTERN, (match, path) => {
    const absoluteUrl = makeAbsoluteUrl(path, baseUrl);
    return `url("${absoluteUrl}")`;
  });
  
  // 4. Reescrever @import em CSS
  result = result.replace(STYLE_URL_PATTERN, (match, path) => {
    const absoluteUrl = makeAbsoluteUrl(path, baseUrl);
    return `@import "${absoluteUrl}"`;
  });
  
  // 5. Remover scripts potencialmente perigosos e trackers
  result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, content) => {
    // Manter apenas scripts inline que não fazem fetch/XMLHttpRequest
    const lowerMatch = match.toLowerCase();
    if (lowerMatch.includes('google-analytics') || 
        lowerMatch.includes('gtag') ||
        lowerMatch.includes('fbq') ||
        lowerMatch.includes('facebook') ||
        lowerMatch.includes('hotjar') ||
        lowerMatch.includes('clarity') ||
        lowerMatch.includes('crisp') ||
        lowerMatch.includes('intercom')) {
      return '<!-- tracking script removed -->';
    }
    return match;
  });
  
  // 6. Remover meta refresh e redirects
  result = result.replace(/<meta[^>]*http-equiv=["']refresh["'][^>]*>/gi, '<!-- redirect removed -->');
  
  // 7. Remover noscript que podem quebrar layout
  // result = result.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
  
  return result;
}

function extractLinks(html: string, baseUrl: URL): Array<{ text: string; href: string; selector: string }> {
  const links: Array<{ text: string; href: string; selector: string }> = [];
  const linkRegex = /<a\s+([^>]*href=["']([^"']*)["'][^>]*)>([^<]*(?:<[^/a][^>]*>[^<]*)*)<\/a>/gi;
  
  let match;
  let index = 0;
  while ((match = linkRegex.exec(html)) !== null) {
    const [, attrs, href, innerContent] = match;
    
    // Extrair texto limpo (remover tags HTML internas)
    const textContent = innerContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      const absoluteHref = makeAbsoluteUrl(href, baseUrl);
      links.push({
        text: textContent || `Link ${index + 1}`,
        href: absoluteHref,
        selector: `a[href="${href}"]`,
      });
      index++;
    }
  }
  
  return links;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Autenticar usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claims?.user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.user.id;

    // 2. Verificar plano do usuário - APENAS Essential e Pro têm acesso
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan_type, subscription_status')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allowedPlans = ['essential', 'essential_yearly', 'pro', 'pro_yearly', 'elite'];
    if (!allowedPlans.includes(profile.plan_type) || profile.subscription_status !== 'active') {
      return new Response(
        JSON.stringify({ 
          error: 'PAYWALL', 
          message: 'O Clonador de Páginas é exclusivo para assinantes Essential e Pro.',
          current_plan: profile.plan_type 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Obter URL alvo
    const body = await req.json();
    const { url: targetUrl } = body;

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Protocolo inválido');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'URL inválida. Use uma URL completa (ex: https://exemplo.com)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar domínios bloqueados
    if (isBlockedDomain(targetUrl)) {
      return new Response(
        JSON.stringify({ 
          error: 'Este domínio não pode ser clonado por razões de segurança e termos de uso.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[clone-page] Cloning ${targetUrl} for user ${userId}`);

    // 4. Buscar página com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`[clone-page] Fetch error:`, fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Tempo limite excedido. O site demorou muito para responder.' }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Não foi possível acessar este site. Verifique se a URL está correta e acessível.' 
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    clearTimeout(timeoutId);

    // Verificar status
    if (!response.ok) {
      if (response.status === 403 || response.status === 503) {
        return new Response(
          JSON.stringify({ 
            error: 'Este site possui proteção avançada de firewall (Cloudflare/WAF). Tente uma URL diferente.' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Erro ao acessar o site: HTTP ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar content-type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return new Response(
        JSON.stringify({ error: 'A URL não retornou uma página HTML válida.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Processar HTML
    let html = await response.text();
    
    // Usar URL final após redirects
    const finalUrl = new URL(response.url || targetUrl);
    
    // Reescrever todos os caminhos relativos para absolutos
    html = rewriteHtml(html, finalUrl);
    
    // Extrair links para o editor
    const links = extractLinks(html, finalUrl);
    
    console.log(`[clone-page] Successfully cloned ${targetUrl}, found ${links.length} links`);

    return new Response(
      JSON.stringify({
        success: true,
        html,
        sourceUrl: finalUrl.href,
        links,
        metadata: {
          title: html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || 'Página Clonada',
          linksCount: links.length,
          size: html.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[clone-page] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno ao processar a página. Tente novamente.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
