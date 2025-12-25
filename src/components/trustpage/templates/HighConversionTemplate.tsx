import { useState } from "react";
import { LandingPageFormData } from "@/types/landing-page";
import { Play, MessageCircle } from "lucide-react";

interface HighConversionTemplateProps {
  data: LandingPageFormData;
}

const HighConversionTemplate = ({ data }: HighConversionTemplateProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const getVideoEmbedUrl = (url: string, autoplay = false) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      const params = autoplay 
        ? '?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1'
        : '?rel=0&modestbranding=1';
      return `https://www.youtube.com/embed/${youtubeMatch[1]}${params}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const params = autoplay
        ? '?autoplay=1&title=0&byline=0&portrait=0'
        : '?title=0&byline=0&portrait=0';
      return `https://player.vimeo.com/video/${vimeoMatch[1]}${params}`;
    }
    
    return null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  const embedUrl = getVideoEmbedUrl(data.video_url, isVideoPlaying);
  const defaultThumbnail = getYouTubeThumbnail(data.video_url);
  // Prioritize user-uploaded thumbnail
  const thumbnail = data.video_thumbnail_url || defaultThumbnail;

  const handlePlayClick = () => {
    setIsVideoPlaying(true);
  };

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

  const headlineSize = data.headline_size || 2;

  return (
    <main
      className="min-h-screen w-full"
      style={{
        backgroundColor: data.colors.background,
        color: data.colors.text,
      }}
    >
      {/* Mobile-first container - max 480px on desktop */}
      <article className="mx-auto w-full max-w-[480px] min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Profile Header */}
          <div className="flex flex-col items-center pt-6 pb-3 px-4">
            {data.profile_image_url ? (
              <img
                src={data.profile_image_url}
                alt="Foto de perfil"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-3 shadow-lg"
                style={{ borderColor: data.colors.buttonBg }}
              />
            ) : (
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
                style={{ backgroundColor: data.colors.buttonBg, color: data.colors.buttonText }}
              >
                {data.page_name?.charAt(0)?.toUpperCase() || 'T'}
              </div>
            )}
            {data.page_name && (
              <p className="mt-2 text-xs opacity-70">{data.page_name}</p>
            )}
          </div>

          {/* Headline - Dynamic size */}
          <div className="px-4 pb-3">
            <h1 
              className="font-extrabold leading-tight text-center"
              style={{ 
                color: data.colors.text,
                fontSize: `${headlineSize}rem`,
                lineHeight: 1.1
              }}
            >
              {data.headline || 'Seu Título Aqui'}
            </h1>
          </div>

          {/* Video with VSL Mask - Reduced gap */}
          <div className="w-full">
            {isVideoPlaying && embedUrl ? (
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : thumbnail || data.video_url ? (
              <div 
                className="aspect-video w-full relative cursor-pointer group overflow-hidden"
                onClick={handlePlayClick}
              >
                {/* Thumbnail - User uploaded takes priority */}
                {thumbnail ? (
                  <img 
                    src={thumbnail} 
                    alt="Video thumbnail"
                    className="w-full h-full object-cover absolute inset-0"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center absolute inset-0"
                    style={{ backgroundColor: `${data.colors.buttonBg}15` }}
                  />
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors z-10">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: data.colors.buttonBg }}
                  >
                    <Play 
                      className="w-8 h-8 sm:w-10 sm:h-10 ml-1" 
                      style={{ color: data.colors.buttonText }}
                      fill={data.colors.buttonText}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="aspect-video w-full flex items-center justify-center"
                style={{ backgroundColor: `${data.colors.buttonBg}15` }}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: data.colors.buttonBg }}
                >
                  <Play 
                    className="w-7 h-7 ml-1" 
                    style={{ color: data.colors.buttonText }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description - Reduced padding */}
          {data.description && (
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed opacity-80 text-center">
                {data.description}
              </p>
            </div>
          )}
        </div>

        {/* CTA Section - Sticky with reduced gap */}
        <div 
          className="sticky bottom-0 p-4 space-y-2"
          style={{ backgroundColor: data.colors.background }}
        >
          {/* Main CTA Button - Pulsing */}
          <button
            onClick={handleCtaClick}
            className="w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95 animate-pulse hover:animate-none"
            style={{ 
              backgroundColor: data.colors.buttonBg, 
              color: data.colors.buttonText,
              boxShadow: `0 4px 20px ${data.colors.buttonBg}50`
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

        {/* Watermark Footer - Larger & More visible */}
        <div 
          className="py-4 text-center"
          style={{ backgroundColor: `${data.colors.text}08` }}
        >
          <p 
            className="text-sm font-medium tracking-wide"
            style={{ opacity: 0.8, color: data.colors.text }}
          >
            ✨ Criado com <span className="font-bold">TrustPage</span>
          </p>
        </div>
      </article>
    </main>
  );
};

export default HighConversionTemplate;
