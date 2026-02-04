import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Supabase Edge Function URL for proxy
const PROXY_URL = `https://myqrydgbrxhrjkrvkgqq.supabase.co/functions/v1/serve-proxy`;

const ClonedPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${PROXY_URL}?slug=${encodeURIComponent(slug)}`);
        
        // Check for errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ${response.status}`);
        }
        
        // Get HTML content as text
        // Note: Supabase returns text/plain for HTML (by design limitation)
        // so we fetch and use srcDoc to render
        const html = await response.text();
        
        // Validate that it looks like HTML
        if (!html.includes('<!') && !html.includes('<html') && !html.includes('<head')) {
          // Might be an error JSON
          try {
            const parsed = JSON.parse(html);
            throw new Error(parsed.error || 'Página não encontrada');
          } catch {
            // It's HTML without doctype, still valid
          }
        }
        
        setHtmlContent(html);
      } catch (err) {
        console.error('[ClonedPageView] Error:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar página');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
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

  // Render via srcDoc - this bypasses Supabase's text/plain Content-Type limitation
  // The browser will render the HTML correctly inside the iframe
  return (
    <iframe
      srcDoc={htmlContent || ''}
      title="Página Clonada"
      // Permissões para o site funcionar (Checkout, Vídeos, Scripts)
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
