import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath.replace(/^http:\/\//, 'https://');
    }
    const absolute = new URL(relativePath, baseUrl);
    absolute.protocol = 'https:';
    return absolute.href;
  } catch {
    return relativePath;
  }
}

function rewriteHtml(html: string, baseUrl: URL): string {
  let result = html;
  
  // Regex patterns para reescrever assets
  const SRC_PATTERN = /(src|href|action|poster)=["'](?!data:|javascript:|#|mailto:|tel:)(\/[^"']*|(?!https?:\/\/)[^"']*)/gi;
  const SRCSET_PATTERN = /srcset=["']([^"']+)["']/gi;
  const URL_CSS_PATTERN = /url\(["']?(?!data:|#)(\/[^)"']+|(?!https?:\/\/)[^)"']+)["']?\)/gi;
  const STYLE_URL_PATTERN = /@import\s+["'](?!data:|#)(\/[^"']+|(?!https?:\/\/)[^"']+)["']/gi;
  
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
  result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
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
  
  return result;
}

function extractLinks(html: string, baseUrl: URL): Array<{ text: string; href: string; selector: string }> {
  const links: Array<{ text: string; href: string; selector: string }> = [];
  const linkRegex = /<a\s+([^>]*href=["']([^"']*)["'][^>]*)>([^<]*(?:<[^/a][^>]*>[^<]*)*)<\/a>/gi;
  
  let match;
  let index = 0;
  while ((match = linkRegex.exec(html)) !== null) {
    const [, , href, innerContent] = match;
    
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

    // 4. Tentar usar Firecrawl para renderizar JavaScript
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    let html: string;
    let finalUrl = parsedUrl;

    if (firecrawlApiKey) {
      console.log('[clone-page] Using Firecrawl for full JS rendering');
      
      try {
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: targetUrl,
            formats: ['html', 'rawHtml'],
            waitFor: 5000, // Aguardar 5s para JavaScript renderizar
            onlyMainContent: false, // Queremos a página inteira
          }),
        });

        const firecrawlData = await firecrawlResponse.json();

        if (!firecrawlResponse.ok) {
          console.error('[clone-page] Firecrawl error:', firecrawlData);
          throw new Error(firecrawlData.error || 'Firecrawl request failed');
        }

        // Usar rawHtml se disponível (HTML original), senão html processado
        html = firecrawlData.data?.rawHtml || firecrawlData.data?.html || '';
        
        if (!html) {
          throw new Error('Firecrawl returned empty HTML');
        }

        // Atualizar URL final se houver redirect
        if (firecrawlData.data?.metadata?.sourceURL) {
          finalUrl = new URL(firecrawlData.data.metadata.sourceURL);
        }

        console.log(`[clone-page] Firecrawl success, got ${html.length} bytes`);
      } catch (firecrawlError) {
        console.error('[clone-page] Firecrawl failed, falling back to fetch:', firecrawlError);
        // Fallback para fetch simples
        html = await fallbackFetch(targetUrl, parsedUrl);
        finalUrl = parsedUrl;
      }
    } else {
      console.log('[clone-page] Firecrawl not configured, using basic fetch');
      html = await fallbackFetch(targetUrl, parsedUrl);
    }

    // 5. Processar HTML
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

// Fallback: fetch simples sem renderização JavaScript
async function fallbackFetch(targetUrl: string, parsedUrl: URL): Promise<string> {
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(targetUrl, {
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

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403 || response.status === 503) {
        throw new Error('Este site possui proteção avançada de firewall (Cloudflare/WAF). Tente uma URL diferente.');
      }
      throw new Error(`Erro ao acessar o site: HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('A URL não retornou uma página HTML válida.');
    }

    return await response.text();
  } catch (fetchError) {
    clearTimeout(timeoutId);
    
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      throw new Error('Tempo limite excedido. O site demorou muito para responder.');
    }
    
    throw fetchError;
  }
}
