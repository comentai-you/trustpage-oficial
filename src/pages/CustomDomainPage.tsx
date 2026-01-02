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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const resolveDomain = async () => {
      const hostname = window.location.hostname;
      const path = location.pathname;

      console.log(`[CustomDomain] Starting resolution for: ${hostname}${path}`);

      // Extract slug directly from path for faster resolution
      const pathSlug = path.replace(/^\//, '').split('/')[0] || '';
      
      try {
        // First, try to resolve via edge function for domain validation
        console.log('[CustomDomain] Calling edge function...');
        const response = await supabase.functions.invoke<ResolvedDomain>('resolve-custom-domain', {
          body: { hostname, path }
        });

        console.log('[CustomDomain] Edge function response:', response);

        if (response.error) {
          console.error('[CustomDomain] Edge function error:', response.error);
          // If edge function fails, try direct slug lookup as fallback
          if (pathSlug) {
            console.log('[CustomDomain] Trying direct slug lookup:', pathSlug);
            setResolvedSlug(pathSlug);
            setLoading(false);
            return;
          }
          throw response.error;
        }

        const data = response.data;

        if (!data?.found) {
          console.log('[CustomDomain] Domain not found or not verified');
          // Try direct slug lookup as fallback
          if (pathSlug) {
            console.log('[CustomDomain] Trying direct slug lookup:', pathSlug);
            setResolvedSlug(pathSlug);
            setLoading(false);
            return;
          }
          setNotFound(true);
          setLoading(false);
          return;
        }

        console.log('[CustomDomain] Domain resolved successfully:', data);

        // Determine which slug to show
        let slugToShow: string | null = null;

        if (data.type === 'page' && data.slug) {
          slugToShow = data.slug;
          console.log('[CustomDomain] Using page slug:', slugToShow);
        } else if (data.type === 'homepage' && data.defaultPage?.slug) {
          slugToShow = data.defaultPage.slug;
          console.log('[CustomDomain] Using homepage slug:', slugToShow);
        } else if (data.type === 'no_pages') {
          console.log('[CustomDomain] No pages published for this domain');
          setNotFound(true);
          setLoading(false);
          return;
        }

        if (slugToShow) {
          console.log('[CustomDomain] Setting resolved slug:', slugToShow);
          setResolvedSlug(slugToShow);
        } else {
          console.log('[CustomDomain] No slug to show, setting notFound');
          setNotFound(true);
        }
      } catch (err) {
        console.error('[CustomDomain] Error resolving custom domain:', err);
        // Final fallback: try using path slug directly
        if (pathSlug) {
          console.log('[CustomDomain] Using path slug as final fallback:', pathSlug);
          setResolvedSlug(pathSlug);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    resolveDomain();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !resolvedSlug) {
    return <NotFound />;
  }

  // Render the landing page with the resolved slug
  return <LandingPageView slugOverride={resolvedSlug} />;
};

export default CustomDomainPage;
