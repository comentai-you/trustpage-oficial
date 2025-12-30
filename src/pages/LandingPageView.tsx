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
import TrustPageWatermark from "@/components/TrustPageWatermark";
import { useIsMobile } from "@/hooks/use-mobile";

// Validate Facebook Pixel ID format (15-16 digits only)
const isValidFacebookPixelId = (pixelId: string): boolean => {
  return /^[0-9]{15,16}$/.test(pixelId);
};

// Inject Facebook Pixel script with validation to prevent XSS
const injectFacebookPixel = (pixelId: string) => {
  if (!pixelId || typeof window === 'undefined') return;
  
  // Validate pixel ID format to prevent script injection
  if (!isValidFacebookPixelId(pixelId)) {
    console.warn('Invalid Facebook Pixel ID format - must be 15-16 digits');
    return;
  }
  
  // Check if already injected
  if (document.getElementById('fb-pixel-script')) return;

  const script = document.createElement('script');
  script.id = 'fb-pixel-script';
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  noscript.id = 'fb-pixel-noscript';
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
  document.body.appendChild(noscript);
};

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

  // Show violation bar if from paid ads AND owner is on essential/free plan
  const showViolationBar = isFromPaidAds && (ownerPlan === 'essential' || ownerPlan === 'free');

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data: page, error } = await supabase
          .rpc('get_published_page_by_slug', { page_slug: slug })
          .maybeSingle();

        if (error) throw error;

        if (!page) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Fetch owner's plan type
        const { data: ownerPlanData } = await supabase
          .rpc('get_page_owner_plan', { page_id: page.id })
          .maybeSingle();
        
        if (ownerPlanData) {
          setOwnerPlan(ownerPlanData.plan_type || 'free');
        }

        // Inject Facebook Pixel if configured (prefer facebook_pixel_id, fallback to pix_pixel_id)
        const pixelId = (page as any).facebook_pixel_id || page.pix_pixel_id;
        if (pixelId) {
          injectFacebookPixel(pixelId);
        }

        // Increment view counter
        const viewKey = `viewed_${page.id}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, 'true');
          void (async () => {
            try {
              await supabase.functions.invoke('increment-page-view', {
                body: { page_id: page.id }
              });
            } catch {
              // Silently ignore
            }
          })();
        }

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
          facebook_pixel_id: (page as any).facebook_pixel_id || '',
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

  // Check if watermark should show (non-PRO users - free/essential show watermark)
  const showWatermark = ownerPlan === 'free' || ownerPlan === 'essential';

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: pageData.colors.background }}
    >
      {showViolationBar && <AdsViolationBar />}
      <div className={`${showViolationBar ? "pt-[100px] sm:pt-[80px]" : ""} ${showWatermark ? "pb-10" : ""}`}>
        {pageData.template_type === 'sales' ? (
          <SalesPageTemplate data={pageData} isMobile={isMobile} />
        ) : pageData.template_type === 'bio' ? (
          <BioLinkTemplate data={pageData} isMobile={isMobile} />
        ) : (
          <HighConversionTemplate data={pageData} isMobile={isMobile} />
        )}
      </div>
      <TrustPageWatermark ownerPlan={ownerPlan} />
    </div>
  );
};

export default LandingPageView;