import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClonedPageData {
  id: string;
  html_content: string;
  page_name: string;
  is_published: boolean;
  source_url: string;
}

// Inject base tag to fix relative paths (CSS, images, scripts)
const injectBaseTag = (html: string, sourceUrl: string): string => {
  try {
    const urlObj = new URL(sourceUrl);
    const baseUrl = urlObj.origin + '/';
    const baseTag = `<base href="${baseUrl}" target="_blank" />`;

    if (html.toLowerCase().includes('<head>')) {
      return html.replace(/<head>/i, `<head>\n${baseTag}`);
    } else if (html.toLowerCase().includes('<html>')) {
      return html.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${baseTag}</head>`);
    } else {
      return `<head>${baseTag}</head>\n${html}`;
    }
  } catch (e) {
    console.warn('Invalid source URL for base tag:', e);
    return html;
  }
};

const ClonedPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<ClonedPageData | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError("Página não encontrada");
        setLoading(false);
        return;
      }

      try {
        console.log('[ClonedPageView] Fetching page with slug:', slug);
        
        // Fetch the cloned page by slug (including source_url for base tag injection)
        const { data, error: fetchError } = await supabase
          .from("cloned_pages")
          .select("id, html_content, page_name, is_published, views, source_url")
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle();

        console.log('[ClonedPageView] Query result:', { data: data ? { id: data.id, hasHtml: !!data.html_content, htmlLength: data.html_content?.length } : null, error: fetchError });

        if (fetchError) throw fetchError;

        if (!data) {
          setError("Página não encontrada ou não publicada");
          setLoading(false);
          return;
        }

        setPageData(data);

        // Increment views (fire and forget)
        supabase
          .from("cloned_pages")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id)
          .then(() => console.log('[ClonedPageView] Views incremented'));

      } catch (err) {
        console.error("Error fetching cloned page:", err);
        setError("Erro ao carregar a página");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  // Write HTML to iframe when data is loaded (with base tag injection)
  useEffect(() => {
    if (pageData && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // Inject base tag to fix relative paths
        const fixedHtml = injectBaseTag(pageData.html_content, pageData.source_url);
        doc.open();
        doc.write(fixedHtml);
        doc.close();
      }
    }
  }, [pageData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title={pageData?.page_name || "Página"}
      className="w-full h-screen border-0"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  );
};

export default ClonedPageView;
