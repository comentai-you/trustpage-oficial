import { LandingPageFormData } from "@/types/landing-page";
import { Play, MessageCircle } from "lucide-react";

interface HighConversionTemplateProps {
  data: LandingPageFormData;
}

const HighConversionTemplate = ({ data }: HighConversionTemplateProps) => {
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return null;
  };

  const embedUrl = getVideoEmbedUrl(data.video_url);

  const handleCtaClick = () => {
    if (data.cta_url) {
      window.open(data.cta_url, '_blank');
    }
  };

  const handleWhatsAppClick = () => {
    if (data.whatsapp_number) {
      window.open(`https://wa.me/${data.whatsapp_number}`, '_blank');
    }
  };

  return (
    <div 
      className="min-h-full flex flex-col"
      style={{ 
        backgroundColor: data.colors.background,
        color: data.colors.text 
      }}
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-6 pb-4 px-4">
          {data.profile_image_url ? (
            <img
              src={data.profile_image_url}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 shadow-lg"
              style={{ borderColor: data.colors.primary }}
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
              style={{ backgroundColor: data.colors.primary, color: '#FFFFFF' }}
            >
              {data.page_name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
          )}
          {data.page_name && (
            <p className="mt-2 text-sm opacity-70">{data.page_name}</p>
          )}
        </div>

        {/* Headline */}
        <div className="px-4 pb-4">
          <h1 
            className="text-xl font-extrabold leading-tight text-center"
            style={{ color: data.colors.text }}
          >
            {data.headline || 'Seu Título Aqui'}
          </h1>
        </div>

        {/* Video - Full Width */}
        <div className="w-full">
          {embedUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div 
              className="aspect-video w-full flex items-center justify-center"
              style={{ backgroundColor: `${data.colors.primary}15` }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: data.colors.primary }}
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed opacity-80 text-center">
              {data.description}
            </p>
          </div>
        )}
      </div>

      {/* CTA Section - Sticky */}
      <div 
        className="sticky bottom-0 p-4 space-y-3"
        style={{ backgroundColor: data.colors.background }}
      >
        {/* Main CTA Button - Pulsing */}
        <button
          onClick={handleCtaClick}
          className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 animate-pulse hover:animate-none"
          style={{ 
            backgroundColor: data.colors.primary, 
            color: '#FFFFFF',
            boxShadow: `0 4px 20px ${data.colors.primary}50`
          }}
        >
          {data.cta_text || 'QUERO AGORA'}
        </button>
        
        {/* WhatsApp Button */}
        {data.whatsapp_number && (
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-all active:scale-95"
            style={{ 
              borderColor: `${data.colors.text}30`,
              color: data.colors.text
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Dúvidas? Fale no WhatsApp
          </button>
        )}
      </div>

      {/* Watermark Footer */}
      <div 
        className="py-3 text-center"
        style={{ backgroundColor: `${data.colors.text}05` }}
      >
        <p className="text-xs opacity-40">
          Criado com TrustPage
        </p>
      </div>
    </div>
  );
};

export default HighConversionTemplate;
