import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import LandingPageView from "./LandingPageView";
import NotFound from "./NotFound";

interface ResolvedDomain {
  found: boolean;
  type?: 'page' | 'homepage' | 'no_pages' | 'cloned_page';
  userId?: string;
  pageId?: string;
  slug?: string;
  defaultPage?: {
    id: string;
    slug: string;
    templateType: string;
    pageName: string;
  };
  pages?: Array<{
    id: string;
    slug: string;
    templateType: string;
    pageName: string;
  }>;
  planType?: string;
  pageName?: string;
  error?: string;
}

interface ClonedPageData {
  id: string;
  html_content: string;
  page_name: string;
}

const CustomDomainPage = () => {
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);
  const [resolvedOwnerId, setResolvedOwnerId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [clonedPageData, setClonedPageData] = useState<ClonedPageData | null>(null);

  const debugEnabled = new URLSearchParams(location.search).has('tp_debug');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Write HTML to iframe when cloned page data is loaded
  useEffect(() => {
    if (clonedPageData && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(clonedPageData.html_content);
        doc.close();
      }
    }
  }, [clonedPageData]);

  useEffect(() => {
    const resolveDomain = async () => {
      const hostname = window.location.hostname;
      const path = location.pathname;

      if (debugEnabled) {
        console.log(`[CustomDomain] Starting resolution for: ${hostname}${path}`);
      }

      // Extract slug directly from path - handle /p/ and /c/ prefixes
      let pathSlug = path || '';
      if (pathSlug.startsWith('/p/') || pathSlug.startsWith('/c/')) {
        pathSlug = pathSlug.substring(3);
      }
      pathSlug = pathSlug.replace(/^\/+/, '').split('/')[0] || '';

      if (debugEnabled) {
        setDebugInfo({
          stage: 'before_invoke',
          hostname,
          path,
          pathSlug,
        });
      }

      try {
        if (debugEnabled) {
          console.log('[CustomDomain] Calling edge function...');
        }
        const response = await supabase.functions.invoke<ResolvedDomain>('resolve-custom-domain', {
          body: { hostname, path },
        });

        if (debugEnabled) {
          console.log('[CustomDomain] Edge function response:', response);
          setDebugInfo({
            stage: 'after_invoke',
            hostname,
            path,
            pathSlug,
            responseError: response.error,
            responseData: response.data,
          });
        }

        // Check for network/invoke errors
        if (response.error) {
          console.error('[CustomDomain] Edge function error:', response.error);
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = response.data;
        if (debugEnabled) {
          console.log('[CustomDomain] Parsed data:', JSON.stringify(data));
        }

        // Domain not found/verified
        if (!data?.found) {
          console.log('[CustomDomain] Domain not found or not verified');
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Handle cloned page type
        if (data.type === 'cloned_page' && data.pageId) {
          console.log('[CustomDomain] Cloned page found, fetching content...');
          
          const { data: clonedPage, error: clonedError } = await supabase
            .from('cloned_pages')
            .select('id, html_content, page_name')
            .eq('id', data.pageId)
            .eq('is_published', true)
            .maybeSingle();

          if (clonedError || !clonedPage) {
            console.error('[CustomDomain] Error fetching cloned page:', clonedError);
            setNotFound(true);
            setLoading(false);
            return;
          }

          setClonedPageData(clonedPage);
          setLoading(false);
          return;
        }

        // Handle response types for landing pages
        if (data.type === 'page' && data.slug) {
          console.log('[CustomDomain] Page found, slug:', data.slug);
          setResolvedOwnerId(data.userId || null);
          setResolvedSlug(data.slug);
        } else if (data.type === 'homepage' && data.defaultPage?.slug) {
          console.log('[CustomDomain] Homepage, default slug:', data.defaultPage.slug);
          setResolvedOwnerId(data.userId || null);
          setResolvedSlug(data.defaultPage.slug);
        } else if (data.type === 'no_pages') {
          console.log('[CustomDomain] No published pages');
          setNotFound(true);
        } else {
          console.log('[CustomDomain] Unexpected response, using path slug:', pathSlug);
          setResolvedOwnerId(data.userId || null);
          if (pathSlug) {
            setResolvedSlug(pathSlug);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        console.error('[CustomDomain] Exception:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    resolveDomain();
  }, [location.pathname, location.search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        {debugEnabled && debugInfo && (
          <div className="fixed bottom-4 left-4 right-4 max-w-3xl mx-auto rounded-lg border bg-background/95 p-3 text-xs text-foreground shadow-lg">
            <div className="font-semibold mb-1">Debug (tp_debug=1)</div>
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  // Render cloned page in iframe
  if (clonedPageData) {
    return (
      <iframe
        ref={iframeRef}
        title={clonedPageData.page_name || "Página"}
        className="w-full h-screen border-0"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    );
  }

  if (notFound || !resolvedSlug) {
    return (
      <>
        {debugEnabled && debugInfo && (
          <div className="fixed bottom-4 left-4 right-4 max-w-3xl mx-auto rounded-lg border bg-background/95 p-3 text-xs text-foreground shadow-lg z-50">
            <div className="font-semibold mb-1">Debug (tp_debug=1)</div>
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify({ ...debugInfo, resolvedSlug, notFound }, null, 2)}</pre>
          </div>
        )}
        <NotFound />
      </>
    );
  }

  // Render the landing page with the resolved slug
  return (
    <>
      {debugEnabled && debugInfo && (
        <div className="fixed bottom-4 left-4 right-4 max-w-3xl mx-auto rounded-lg border bg-background/95 p-3 text-xs text-foreground shadow-lg z-50">
          <div className="font-semibold mb-1">Debug (tp_debug=1)</div>
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify({ ...debugInfo, resolvedSlug, notFound }, null, 2)}</pre>
        </div>
      )}
      <LandingPageView slugOverride={resolvedSlug} ownerIdOverride={resolvedOwnerId} />
    </>
  );
};

export default CustomDomainPage;
