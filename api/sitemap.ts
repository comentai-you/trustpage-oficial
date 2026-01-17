export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  // URL da sua função no Supabase
  const SUPABASE_URL = "https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/sitemap";

  try {
    // Busca o XML no Supabase
    const response = await fetch(SUPABASE_URL, {
      method: "GET",
      headers: {
        Accept: "application/xml, text/xml, text/plain, */*",
        "User-Agent": "TrustPage-Sitemap-Proxy",
      },
    });

    if (!response.ok) {
      console.error(`Erro Supabase: ${response.status}`);
      return new Response(`Erro na origem: ${response.status}`, { status: 500 });
    }

    const xmlData = await response.text();

    // Retorna para o navegador como XML válido
    return new Response(xmlData, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return new Response("Erro ao gerar sitemap", { status: 500 });
  }
}
