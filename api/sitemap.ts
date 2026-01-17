export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const supabaseFunctionUrl = 'https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/sitemap';
  
  try {
    const response = await fetch(supabaseFunctionUrl);
    const xml = await response.text();
    
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      },
    });
  } catch (error) {
    return new Response('Error loading sitemap', { status: 500 });
  }
}
