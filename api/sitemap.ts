export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  const SUPABASE_URL = "https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/sitemap";

  try {
    console.log("Iniciando fetch do sitemap...");

    const response = await fetch(SUPABASE_URL, {
      method: "GET",
      headers: {
        // Dizemos explicitamente ao Supabase que aceitamos XML ou texto
        Accept: "application/xml, text/xml, text/plain, */*",
        // Identificamos o User-Agent para evitar bloqueios de bot
        "User-Agent": "TrustPage-Proxy/1.0",
      },
    });

    // Se o Supabase rejeitar (ex: 406, 404, 500), pegamos o erro
    if (!response.ok) {
      console.error(`Erro do Supabase: ${response.status} ${response.statusText}`);
      // Tentamos ler o corpo do erro para entender (geralmente é um JSON com o motivo)
      const errorText = await response.text();
      return new Response(`Erro na origem (Supabase): ${response.status} - ${errorText}`, {
        status: response.status,
      });
    }

    const xmlData = await response.text();

    console.log("Sitemap recebido com sucesso. Tamanho:", xmlData.length);

    return new Response(xmlData, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (e) {
    console.error("Erro fatal no proxy:", e);
    return new Response("Erro interno ao gerar sitemap", { status: 500 });
  }
}
