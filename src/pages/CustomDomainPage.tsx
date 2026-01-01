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

      console.log(`Resolving custom domain: ${hostname}${path}`);

      try {
        const { data, error } = await supabase.functions.invoke<ResolvedDomain>('resolve-custom-domain', {
          body: { hostname, path }
        });

        if (error) throw error;

        if (!data?.found) {
          console.log('Domain not found or not verified');
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Determine which slug to show
        let slugToShow: string | null = null;

        if (data.type === 'page' && data.slug) {
          // Direct page access via path
          slugToShow = data.slug;
        } else if (data.type === 'homepage' && data.defaultPage?.slug) {
          // Homepage - show default page
          slugToShow = data.defaultPage.slug;
        } else if (data.type === 'no_pages') {
          // No pages published
          setNotFound(true);
          setLoading(false);
          return;
        }

        if (slugToShow) {
          setResolvedSlug(slugToShow);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error resolving custom domain:', err);
        setNotFound(true);
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
