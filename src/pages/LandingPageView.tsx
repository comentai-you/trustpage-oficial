import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LandingPageFormData, defaultFormData, LandingPageColors } from "@/types/landing-page";
import HighConversionTemplate from "@/components/trustpage/templates/HighConversionTemplate";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const TRIAL_DAYS = 14;

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<LandingPageFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch page data
        const { data: page, error } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle();

        if (error) throw error;

        if (!page) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Check owner's subscription status
        const { data: ownerProfile, error: profileError } = await supabase
          .from("profiles")
          .select("created_at, subscription_status")
          .eq("id", page.user_id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (ownerProfile) {
          const isTrialUser = ownerProfile.subscription_status === 'trial';
          
          if (isTrialUser) {
            const createdAt = new Date(ownerProfile.created_at);
            const now = new Date();
            const diffTime = now.getTime() - createdAt.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const trialExpired = diffDays >= TRIAL_DAYS;
            
            if (trialExpired) {
              setSuspended(true);
              setLoading(false);
              return;
            }
          }
        }

        // Increment view counter (fire and forget)
        supabase
          .from("landing_pages")
          .update({ views: (page.views || 0) + 1 })
          .eq("id", page.id)
          .then(() => {});

        // Map database data to form data format
        const colors = page.colors as unknown as LandingPageColors || defaultFormData.colors;
        
        setPageData({
          slug: page.slug,
          template_id: page.template_id,
          page_name: page.page_name || '',
          profile_image_url: page.profile_image_url || '',
          headline: page.headline || '',
          subheadline: page.subheadline || '',
          video_url: page.video_url || '',
          video_storage_path: page.video_storage_path || '',
          video_thumbnail_url: '',
          description: page.description || '',
          image_url: page.image_url || '',
          cta_text: page.cta_text || 'QUERO AGORA',
          cta_url: page.cta_url || '',
          whatsapp_number: page.whatsapp_number || '',
          pix_pixel_id: page.pix_pixel_id || '',
          colors,
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

  // Suspended page view
  if (suspended) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-muted via-background to-muted px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Página Temporariamente Suspensa</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Esta página está temporariamente indisponível. Entre em contato com o proprietário para mais informações.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Criar minha própria página
            </Link>
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-semibold">TrustPage</span>
            </p>
          </div>
        </div>
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
            A página que você está procurando não existe ou não está publicada.
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
    <div className="min-h-screen">
      <HighConversionTemplate data={pageData} />
    </div>
  );
};

export default LandingPageView;
