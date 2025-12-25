import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { LandingPageFormData, defaultFormData, LandingPageColors } from "@/types/landing-page";
import HighConversionTemplate from "@/components/trustpage/templates/HighConversionTemplate";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AdsViolationBar from "@/components/AdsViolationBar";
import { useIsMobile } from "@/hooks/use-mobile";

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [pageData, setPageData] = useState<LandingPageFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ownerPlan, setOwnerPlan] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Detect if user came from paid ads (fbclid, gclid, utm_source=ads)
  const isFromPaidAds = useMemo(() => {
    const hasFbclid = searchParams.has('fbclid');
    const hasGclid = searchParams.has('gclid');
    const hasUtmAds = searchParams.get('utm_source') === 'ads';
    return hasFbclid || hasGclid || hasUtmAds;
  }, [searchParams]);

  // Show violation bar if from paid ads AND owner is on essential/trial plan
  const showViolationBar = isFromPaidAds && (ownerPlan === 'essential' || ownerPlan === 'trial');

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch page data - RLS policy already filters by:
        // - is_published = true
        // - owner has active subscription or valid trial
        const { data: page, error } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error) throw error;

        if (!page) {
          // Page not found OR owner's subscription expired (RLS hides it)
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Fetch owner's plan type to check ads violation
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("plan_type, subscription_status")
          .eq("id", page.user_id)
          .maybeSingle();
        
        if (ownerProfile) {
          // If trial, treat as essential for ads detection
          if (ownerProfile.subscription_status === 'trial') {
            setOwnerPlan('trial');
          } else {
            setOwnerPlan(ownerProfile.plan_type || 'essential');
          }
        }

        // Increment view counter with fingerprint for server-side deduplication
        // Generate a simple fingerprint based on browser characteristics
        const generateFingerprint = (): string => {
          const nav = navigator;
          const screen = window.screen;
          const fingerprint = [
            nav.userAgent,
            nav.language,
            screen.width,
            screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
          ].join('|');
          // Simple hash function
          let hash = 0;
          for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }
          return Math.abs(hash).toString(36);
        };

        const viewKey = `viewed_${page.id}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, 'true');
          const fingerprint = generateFingerprint();
          // Use void to explicitly ignore the promise
          void (async () => {
            try {
              await supabase.rpc('increment_page_views', { 
                page_id: page.id,
                viewer_fingerprint: fingerprint
              });
            } catch {
              // Silently ignore view count errors
            }
          })();
        }

        // Map database data to form data format
        const colors = page.colors as unknown as LandingPageColors || defaultFormData.colors;
        
        setPageData({
          slug: page.slug,
          template_id: page.template_id,
          page_name: page.page_name || '',
          profile_image_url: page.profile_image_url || '',
          headline: page.headline || '',
          headline_size: 2,
          headline_size_mobile: 1.2,
          headline_size_desktop: 2.5,
          subheadline: page.subheadline || '',
          video_url: page.video_url || '',
          video_storage_path: page.video_storage_path || '',
          video_thumbnail_url: '',
          description: page.description || '',
          image_url: page.image_url || '',
          cta_text: page.cta_text || 'QUERO AGORA',
          cta_url: page.cta_url || '',
          cta_delay_enabled: page.cta_delay_enabled ?? false,
          cta_delay_percentage: page.cta_delay_percentage ?? 50,
          whatsapp_number: page.whatsapp_number || '',
          pix_pixel_id: page.pix_pixel_id || '',
          colors,
          theme: 'dark',
        });
      } catch (error) {
        console.error("Error fetching page:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !pageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Página não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            A página que você está procurando não existe ou não está disponível.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: pageData.colors.background }}
    >
      {showViolationBar && <AdsViolationBar />}
      <div className={showViolationBar ? "pt-[100px] sm:pt-[80px]" : ""}>
        <HighConversionTemplate data={pageData} isMobile={isMobile} />
      </div>
    </div>
  );
};

export default LandingPageView;
