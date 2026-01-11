import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import LandingPageView from "./LandingPageView";
import NotFound from "./NotFound";

interface ResolvedDomain {
  found: boolean;
  type?: 'page' | 'homepage' | 'no_pages';
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
  error?: string;
}

const CustomDomainPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);
  const [resolvedOwnerId, setResolvedOwnerId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const debugEnabled = new URLSearchParams(location.search).has('tp_debug');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const resolveDomain = async () => {
      const hostname = window.location.hostname;
      const path = location.pathname;

      if (debugEnabled) {
        console.log(`[CustomDomain] Starting resolution for: ${hostname}${path}`);
      }

      // Extract slug directly from path - handle /p/ prefix for legacy support
      let pathSlug = path || '';
      if (pathSlug.startsWith('/p/')) {
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
          // Segurança: sem conseguir resolver domínio -> NÃO pode tentar "achar por slug" (evita vazamento)
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

        // Handle response types
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
          // Unexpected response - fallback seguro: tenta o slug do path, mas sempre preso ao userId do domínio
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
        // Segurança: sem conseguir resolver domínio -> não renderiza nada
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
