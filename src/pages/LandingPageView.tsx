import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LandingPageFormData, defaultFormData, LandingPageColors } from "@/types/landing-page";
import HighConversionTemplate from "@/components/trustpage/templates/HighConversionTemplate";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<LandingPageFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

        // Increment view counter (bypass RLS via security definer function)
        const viewKey = `viewed_${page.id}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, 'true');
          try {
            await supabase.rpc('increment_page_views', { page_id: page.id });
          } catch {
            // Ignore view count errors silently
          }
        }

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
    <div className="min-h-screen">
      <HighConversionTemplate data={pageData} />
    </div>
  );
};

export default LandingPageView;
