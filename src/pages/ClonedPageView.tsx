import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Supabase Edge Function URL for proxy
const PROXY_URL = `https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/serve-proxy`;

const ClonedPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${PROXY_URL}?slug=${encodeURIComponent(slug)}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ${response.status}`);
        }
        
        const html = await response.text();
        
        // Validate that it looks like HTML
        if (!html.includes('<!') && !html.includes('<html') && !html.includes('<head')) {
          try {
            const parsed = JSON.parse(html);
            throw new Error(parsed.error || 'Página não encontrada');
          } catch {
            // It's HTML without doctype, still valid
          }
        }
        
        // Create a Blob URL with text/html MIME type
        // This makes the iframe load the HTML as a real page with a proper origin,
        // allowing images, videos, and embeds to load correctly.
        const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Revoke previous blob URL if any
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = url;
        setBlobUrl(url);
      } catch (err) {
        console.error('[ClonedPageView] Error:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar página');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [slug]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Erro</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Render via Blob URL - this gives the iframe a proper origin
  // so images, videos, and embeds load correctly (unlike srcDoc which has null origin)
  return (
    <iframe
      src={blobUrl || ''}
      title="Página Clonada"
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
        overflow: "hidden",
        zIndex: 9999,
        backgroundColor: "#ffffff",
      }}
      allowFullScreen
    />
  );
};

export default ClonedPageView;
