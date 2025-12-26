import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { LandingPageFormData, defaultFormData, LandingPageColors, defaultSalesContent, SalesPageContent, TemplateType } from "@/types/landing-page";
import HighConversionTemplate from "@/components/trustpage/templates/HighConversionTemplate";
import SalesPageTemplate from "@/components/trustpage/templates/SalesPageTemplate";
import BioLinkTemplate from "@/components/trustpage/templates/BioLinkTemplate";
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
        // Use secure RPC function that doesn't expose user_id
        // This function only returns published pages from users with active subscriptions
        const { data: page, error } = await supabase
          .rpc('get_published_page_by_slug', { page_slug: slug })
          .maybeSingle();

        if (error) throw error;

        if (!page) {
          // Page not found OR owner's subscription expired (RPC hides it)
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Fetch owner's plan type using secure RPC function
        // This doesn't expose the user_id, only returns plan info for the page
        const { data: ownerPlanData } = await supabase
          .rpc('get_page_owner_plan', { page_id: page.id })
          .maybeSingle();
        
        if (ownerPlanData) {
          if (ownerPlanData.is_trial) {
            setOwnerPlan('trial');
          } else {
            setOwnerPlan(ownerPlanData.plan_type || 'essential');
          }
        }

        // Increment view counter via Edge Function with IP-based rate limiting
        const viewKey = `viewed_${page.id}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, 'true');
          // Call Edge Function for server-side IP-based view tracking
          void (async () => {
            try {
              await supabase.functions.invoke('increment-page-view', {
                body: { page_id: page.id }
              });
            } catch {
              // Silently ignore view count errors
            }
          })();
        }

        // Map database data to form data format
        const colors = page.colors as unknown as LandingPageColors || defaultFormData.colors;
        const content = page.content as unknown as SalesPageContent || defaultSalesContent;
        const templateType = (page.template_type as TemplateType) || 'vsl';
        
        setPageData({
          slug: page.slug,
          template_id: page.template_id,
          template_type: templateType,
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
          cover_image_url: page.cover_image_url || '',
          cta_text: page.cta_text || 'QUERO AGORA',
          cta_url: page.cta_url || '',
          cta_delay_enabled: page.cta_delay_enabled ?? false,
          cta_delay_percentage: page.cta_delay_percentage ?? 50,
          whatsapp_number: page.whatsapp_number || '',
          pix_pixel_id: page.pix_pixel_id || '',
          colors,
          primary_color: page.primary_color || '#8B5CF6',
          content,
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
        {pageData.template_type === 'sales' ? (
          <SalesPageTemplate data={pageData} isMobile={isMobile} />
        ) : pageData.template_type === 'bio' ? (
          <BioLinkTemplate data={pageData} isMobile={isMobile} />
        ) : (
          <HighConversionTemplate data={pageData} isMobile={isMobile} />
        )}
      </div>
    </div>
  );
};

export default LandingPageView;