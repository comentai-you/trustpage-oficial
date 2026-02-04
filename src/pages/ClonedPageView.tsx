import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Supabase Edge Function URL for proxy
const PROXY_URL = `https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/serve-proxy`;

const ClonedPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Página não encontrada");
      setLoading(false);
      return;
    }

    // Just mark as loaded - the iframe will handle everything via proxy
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">{error || "Página não encontrada"}</p>
        </div>
      </div>
    );
  }

  // Render the page via proxy in an iframe that fills the entire viewport
  const proxyUrl = `${PROXY_URL}?slug=${encodeURIComponent(slug)}`;

  return (
    <iframe
      src={proxyUrl}
      title="Página"
      className="w-full h-screen border-0"
      style={{ 
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none'
      }}
    />
  );
};

export default ClonedPageView;
