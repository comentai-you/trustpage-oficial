import { useParams } from "react-router-dom";

// Supabase Edge Function URL for proxy
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

  // CRITICAL: Use iframe with src pointing DIRECTLY to the Edge Function
  // The browser will load the proxy URL inside the iframe and render it as HTML
  // DO NOT fetch the content - let the browser handle it natively
  const proxyUrl = `${PROXY_URL}?slug=${encodeURIComponent(slug)}`;

  return (
    <iframe
      src={proxyUrl}
      title="Página Clonada"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
      allowFullScreen
    />
  );
};

export default ClonedPageView;
