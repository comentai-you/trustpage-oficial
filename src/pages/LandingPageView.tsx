import { useParams } from "react-router-dom";
import { LandingPageFormData, defaultFormData } from "@/types/landing-page";
import HighConversionTemplate from "@/components/trustpage/templates/HighConversionTemplate";

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();

  // Mock data - will be replaced with Supabase fetch
  const pageData: LandingPageFormData = {
    ...defaultFormData,
    slug: slug || '',
    page_name: 'Método Emagrecer Rápido',
    headline: 'Descubra Como Emagrecer 10kg em 30 Dias Sem Dieta Restritiva',
    description: 'O método cientificamente comprovado que já transformou a vida de mais de 50.000 pessoas.',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cta_text: 'QUERO COMEÇAR AGORA',
    cta_url: 'https://pay.hotmart.com',
    whatsapp_number: '5511999999999',
  };

  return (
    <div className="min-h-screen">
      <HighConversionTemplate data={pageData} />
    </div>
  );
};

export default LandingPageView;
