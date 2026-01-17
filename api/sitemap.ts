export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  try {
    // Busca o XML gerado pela sua Edge Function no Supabase
    const response = await fetch("https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/sitemap");

    // Se der erro no Supabase, lança exceção
    if (!response.ok) {
      throw new Error(`Erro no Supabase: ${response.status}`);
    }

    const xml = await response.text();

    // Retorna a resposta formatada como XML
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar sitemap:", error);
    return new Response("Erro ao gerar sitemap", { status: 500 });
  }
}
