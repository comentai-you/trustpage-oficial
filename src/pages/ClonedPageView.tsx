import { useParams } from "react-router-dom";

// Supabase Edge Function URL for proxy
// Dica: No futuro, mova isso para variáveis de ambiente (VITE_SUPABASE_URL)
const PROXY_URL = `https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/serve-proxy`;

const ClonedPageView = () => {
  const { slug } = useParams<{ slug: string }>();

  // If no slug, show 404
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">Página não encontrada</p>
        </div>
      </div>
    );
  }

  // Monta a URL do Proxy
  const proxyUrl = `${PROXY_URL}?slug=${encodeURIComponent(slug)}`;

  return (
    <iframe
      src={proxyUrl}
      title="Página Clonada"
      // ADIÇÃO IMPORTANTE: Permissões para o site funcionar (Checkout, Vídeos, Scripts)
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        margin: 0,
        padding: 0,
        overflow: "hidden", // Esconde scrollbars duplas
        zIndex: 9999, // Garante que fique acima de tudo
        backgroundColor: "#ffffff", // Evita flash branco/preto no carregamento
      }}
      allowFullScreen
    />
  );
};

export default ClonedPageView;
