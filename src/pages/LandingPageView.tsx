import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { LandingPageFormData, defaultFormData, LandingPageColors, defaultSalesContent, TemplateType } from "@/types/landing-page";
import HighConversionTemplate from "@/components/trustpage/templates/HighConversionTemplate";
import SalesPageTemplate from "@/components/trustpage/templates/SalesPageTemplate";
import BioLinkTemplate from "@/components/trustpage/templates/BioLinkTemplate";
import HeroCaptureTemplate from "@/components/trustpage/templates/HeroCaptureTemplate";
import LegalPageTemplate from "@/components/trustpage/templates/LegalPageTemplate";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AdsViolationBar from "@/components/AdsViolationBar";
import { PageOwnerProvider } from "@/contexts/PageOwnerContext";
import { useTrackPageVisit } from "@/hooks/useTrackPageVisit";

import { useIsMobile } from "@/hooks/use-mobile";

interface LandingPageViewProps {
  slugOverride?: string;
  ownerIdOverride?: string | null;
}

const LEGAL_SLUGS = new Set(["politica-de-privacidade", "termos-de-uso", "contato"]);

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

const LandingPageView = ({ slugOverride, ownerIdOverride }: LandingPageViewProps = {}) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = slugOverride || paramSlug;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [pageData, setPageData] = useState<LandingPageFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ownerPlan, setOwnerPlan] = useState<string | null>(null);
  const [pageOwnerId, setPageOwnerId] = useState<string | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Track page visit with detailed analytics
  useTrackPageVisit({ pageId: currentPageId || '' });

  const isLegalPage = useMemo(() => {
    if (!slug) return false;
    return LEGAL_SLUGS.has(String(slug).toLowerCase());
  }, [slug]);

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
        const ownerParam = searchParams.get('owner');
        const isLegalSlug = LEGAL_SLUGS.has(String(slug).toLowerCase());

        let page: any = null;
        let legalOwnerId: string | null = null;

        // PÁGINAS LEGAIS: sempre precisam de owner (NUNCA pode cair em "qualquer página publicada")
        if (isLegalSlug) {
          legalOwnerId = ownerParam || ownerIdOverride || null;

          // Se não veio owner (visitante), mas o usuário está logado, usa o próprio auth.uid()
          if (!legalOwnerId) {
            const { data: userData } = await supabase.auth.getUser();
            legalOwnerId = userData.user?.id ?? null;
          }

          // Sem owner = não existe contexto para a página legal -> 404 (evita vazamento entre usuários)
          if (!legalOwnerId) {
            page = null;
          } else {
            const { data, error } = await supabase
              .from('landing_pages')
              .select('*')
              .eq('user_id', legalOwnerId)
              .eq('slug', String(slug))
              .eq('is_published', true)
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (error) throw error;
            page = data;
          }
        } else if (ownerIdOverride) {
          // DOMÍNIO CUSTOMIZADO: o slug só faz sentido dentro do dono do domínio
          const { data, error } = await supabase
            .from('landing_pages')
            .select('*')
            .eq('user_id', ownerIdOverride)
            .eq('slug', String(slug))
            .eq('is_published', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) throw error;
          page = data;
        } else {
          // Páginas normais: slug público (assumido único) via RPC
          const { data, error } = await supabase
            .rpc('get_published_page_by_slug', { page_slug: slug })
            .maybeSingle();

          if (error) throw error;
          page = data;
        }

        if (!page) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Store the page ID for analytics tracking
        setCurrentPageId(page.id);

        // Store the page owner ID for legal footer links
        if (isLegalSlug) {
          setPageOwnerId(legalOwnerId);
        } else if (page.user_id) {
          setPageOwnerId(page.user_id);
        } else {
          setPageOwnerId(null);
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
        const content = (page.content ?? defaultSalesContent) as any;
        const templateType = (page.template_type as TemplateType) || 'vsl';

        // Extract headline sizes from content JSON (where they are persisted)
        const headlineSizeMobile = content?.headline_size_mobile ?? 1.2;
        const headlineSizeDesktop = content?.headline_size_desktop ?? 2.5;

        const headline = page.headline || '';
        const pageTitle = headline || page.page_name || page.slug;
        if (pageTitle) document.title = `${pageTitle} | TrustPage`;

        setPageData({
          slug: page.slug,
          template_id: page.template_id,
          template_type: templateType,
          page_name: page.page_name || '',
          profile_image_url: page.profile_image_url || '',
          headline: page.headline || '',
          headline_size: 2,
          headline_size_mobile: headlineSizeMobile,
          headline_size_desktop: headlineSizeDesktop,
          hero_image_size_mobile: content?.hero_image_size_mobile ?? 100,
          hero_image_size_desktop: content?.hero_image_size_desktop ?? 100,
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
          google_tag_id: content?.google_tag_id || '',
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
  }, [slug, location.pathname, location.search]);

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

  // Páginas legais sempre renderizam como documento (não como template Bio/VSL)
  if (isLegalPage) {
    return (
      <PageOwnerProvider ownerId={pageOwnerId}>
        <LegalPageTemplate data={pageData} />
      </PageOwnerProvider>
    );
  }

  return (
    <PageOwnerProvider ownerId={pageOwnerId}>
      <div 
        className="min-h-screen"
        style={{ backgroundColor: pageData.colors.background }}
      >
        {showViolationBar && <AdsViolationBar />}
        <div className={`${showViolationBar ? "pt-[100px] sm:pt-[80px]" : ""}`}>
          {pageData.template_type === 'sales' ? (
            <SalesPageTemplate data={pageData} isMobile={isMobile} ownerPlan={ownerPlan} />
          ) : pageData.template_type === 'bio' ? (
            <BioLinkTemplate data={pageData} isMobile={isMobile} ownerPlan={ownerPlan} />
          ) : pageData.template_type === 'capture-hero' ? (
            <HeroCaptureTemplate data={pageData} isMobile={isMobile} pageId={currentPageId || undefined} fullHeight />
          ) : (
            <HighConversionTemplate data={pageData} isMobile={isMobile} ownerPlan={ownerPlan} />
          )}
        </div>
      </div>
    </PageOwnerProvider>
  );
};

export default LandingPageView;