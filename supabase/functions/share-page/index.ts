import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { renderSharePage } from './metadata.ts';

const appDomains = ['tpage.com.br', 'localhost', '127.0.0.1', 'trustpage.app', 'lovable.app', 'lovableproject.com', 'trustpage-one.vercel.app'];
const legalSlugs = ['politica-de-privacidade', 'termos-de-uso', 'contato'];

Deno.serve(async (req) => {
  const headers = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; img-src https:; base-uri 'none'; frame-ancestors 'none'" };
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (!['GET', 'HEAD'].includes(req.method)) return new Response('Método não permitido', { status: 405, headers });
  try {
    const params = new URL(req.url).searchParams;
    const hostname = (params.get('hostname') || '').toLowerCase();
    const path = params.get('path') || '/';
    if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(hostname) || hostname.length > 253 || !/^\/[a-zA-Z0-9/_-]*$/.test(path) || path.length > 300) {
      return new Response('Endereço inválido', { status: 400, headers });
    }
    const normalizedHost = hostname.replace(/^www\./, '');
    if (normalizedHost === 'trustpageapp.com') return new Response('Página indisponível neste domínio', { status: 404, headers });
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !anonKey) throw new Error('Missing Supabase configuration');
    const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const isAppDomain = appDomains.some((domain) => normalizedHost === domain || normalizedHost.endsWith(`.${domain}`));
    let slug = path.match(/^\/p\/([^/]+)\/?$/)?.[1];
    let ownerId: string | null = null;
    if (!isAppDomain) {
      const { data: resolved, error } = await client.functions.invoke('resolve-custom-domain', { body: { hostname, path } });
      if (error || !resolved?.found || !['page', 'homepage'].includes(resolved.type)) return new Response('Página não encontrada', { status: 404, headers });
      slug = resolved.slug;
      ownerId = resolved.userId;
    }
    if (!slug || legalSlugs.includes(slug)) return new Response('Página não encontrada', { status: 404, headers });
    const result = ownerId
      ? await client.rpc('get_published_page_by_owner_and_slug', { owner_id: ownerId, page_slug: slug }).maybeSingle()
      : await client.rpc('get_published_page_by_slug', { page_slug: slug }).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return new Response('Página não encontrada', { status: 404, headers });
    return new Response(req.method === 'HEAD' ? null : renderSharePage(result.data, `https://${hostname}${path}`), { headers });
  } catch (error) {
    console.error('Share metadata failed:', error instanceof Error ? error.message : 'Unknown error');
    return new Response('Não foi possível carregar a página', { status: 503, headers });
  }
});