import { useState } from "react";
import { HeroSection } from "@/types/section-builder";
import { Play, Shield, Clock, Check, ArrowRight, Image as ImageIcon } from "lucide-react";
import ImageCarousel from "../ImageCarousel";

interface HeroRendererProps {
  data: HeroSection['data'];
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
  ctaUrl?: string;
}

const HeroRenderer = ({ 
  data, 
  primaryColor, 
  textColor, 
  backgroundColor,
  isDarkTheme,
  isMobile = false,
  ctaUrl
}: HeroRendererProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const getVideoEmbedUrl = (url: string, autoplay = false) => {
    if (!url) return null;
    
    try {
      const parsed = new URL(url);
      const youtubeHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'];
      if (youtubeHosts.includes(parsed.hostname)) {
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (!youtubeMatch) return null;
        const videoId = youtubeMatch[1];
        const baseParams = `controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`;
        return `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&playsinline=1&' : ''}${baseParams}`;
      }
      
      const vimeoHosts = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];
      if (vimeoHosts.includes(parsed.hostname)) {
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (!vimeoMatch) return null;
        const videoId = vimeoMatch[1];
        const baseParams = 'controls=0&title=0&byline=0&portrait=0&sidedock=0';
        return `https://player.vimeo.com/video/${videoId}?${autoplay ? 'autoplay=1&' : ''}${baseParams}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleCtaClick = () => {
    const url = data.ctaUrl || ctaUrl;
    if (url) window.open(url, '_blank');
  };

  const CTAButton = () => (
    <button
      onClick={handleCtaClick}
      className="w-full font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-3 py-5 md:py-6 text-lg md:text-xl"
      style={{
        backgroundColor: primaryColor,
        color: '#FFFFFF',
        boxShadow: `0 12px 40px ${primaryColor}50`,
      }}
    >
      {data.ctaText || "QUERO AGORA"}
      <ArrowRight className="w-6 h-6" />
    </button>
  );

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className={`${isMobile ? '' : 'lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center'}`}>
          
          {/* Text Content */}
          <div className={`${isMobile ? 'text-center' : 'text-center lg:text-left'} mb-8 lg:mb-0`}>
            <h1
              className="font-black leading-[1.1] mb-5 md:mb-6"
              style={{
                fontSize: isMobile ? '2rem' : 'clamp(2.2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.02em',
                color: textColor,
              }}
            >
              {data.headline || "Transforme Sua Vida Hoje"}
            </h1>

            {data.subheadline && (
              <p
                className="text-xl md:text-2xl lg:text-[1.65rem] mb-8 max-w-xl mx-auto lg:mx-0"
                style={{ color: textColor, opacity: 0.8, lineHeight: '1.7' }}
              >
                {data.subheadline}
              </p>
            )}

            {/* CTA for Mobile */}
            {isMobile && data.showCta !== false && (
              <div className="mb-8">
                <CTAButton />
              </div>
            )}

            {/* Desktop CTA */}
            {!isMobile && data.showCta !== false && (
              <div className="hidden lg:block max-w-md">
                <CTAButton />
                <div className="flex items-center justify-start gap-6 mt-5 text-sm" style={{ opacity: 0.6, color: textColor }}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: primaryColor }} />
                    <span>Compra segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                    <span>Acesso imediato</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hero Media */}
          <div className="w-full">
            {data.mediaType === 'video' && data.videoUrl ? (
              isVideoPlaying ? (
                <div 
                  className="relative aspect-video rounded-2xl overflow-hidden"
                  style={{ 
                    boxShadow: isDarkTheme 
                      ? `0 0 80px ${primaryColor}30, 0 25px 50px -12px rgba(0,0,0,0.5)` 
                      : `0 25px 50px -12px rgba(0,0,0,0.25)`,
                    border: isDarkTheme ? `2px solid ${primaryColor}40` : `1px solid rgba(0,0,0,0.1)`
                  }}
                >
                  <iframe
                    src={getVideoEmbedUrl(data.videoUrl, true) || ''}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div
                  className="aspect-video w-full relative cursor-pointer group rounded-2xl overflow-hidden"
                  onClick={() => setIsVideoPlaying(true)}
                  style={{ 
                    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.03)',
                    border: isDarkTheme ? `2px solid ${primaryColor}50` : `1px solid rgba(0,0,0,0.1)`,
                    boxShadow: isDarkTheme 
                      ? `0 0 80px ${primaryColor}25, 0 25px 60px -12px rgba(0,0,0,0.6)` 
                      : `0 25px 50px -12px rgba(0,0,0,0.15)`
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: primaryColor, boxShadow: `0 0 80px ${primaryColor}80` }}
                    >
                      <Play className="w-8 h-8 md:w-10 md:h-10 ml-1 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span style={{ color: textColor, opacity: 0.7 }} className="text-sm font-medium">Clique para assistir</span>
                  </div>
                </div>
              )
            ) : data.mediaType === 'carousel' && data.carouselImages && data.carouselImages.length > 0 ? (
              <ImageCarousel
                images={data.carouselImages}
                interval={data.carouselInterval || 4}
                primaryColor={primaryColor}
                isDarkTheme={isDarkTheme}
                alt={data.headline || 'Produto'}
              />
            ) : data.imageUrl ? (
              <div 
                className="rounded-2xl overflow-hidden"
                style={{ 
                  boxShadow: isDarkTheme 
                    ? `0 0 80px ${primaryColor}25, 0 25px 60px -12px rgba(0,0,0,0.5)` 
                    : `0 25px 50px -12px rgba(0,0,0,0.2)`,
                  border: isDarkTheme ? `2px solid ${primaryColor}40` : `1px solid rgba(0,0,0,0.1)`
                }}
              >
                <img
                  src={data.imageUrl}
                  alt={data.headline || 'Produto'}
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : (
              <div 
                className="aspect-[4/3] rounded-2xl flex items-center justify-center"
                style={{ 
                  backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.02)',
                  border: isDarkTheme ? `2px dashed ${primaryColor}60` : `2px dashed rgba(0,0,0,0.2)`
                }}
              >
                <div className="text-center p-8">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor, opacity: 0.6 }} />
                  <p className="text-sm" style={{ color: textColor, opacity: 0.5 }}>Adicione uma imagem ou vídeo</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile trust indicators */}
        {isMobile && data.showCta !== false && (
          <div className="mt-8">
            <div className="flex items-center justify-center gap-4 text-xs" style={{ opacity: 0.6, color: textColor }}>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" style={{ color: primaryColor }} />
                <span>Seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" style={{ color: primaryColor }} />
                <span>Acesso imediato</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" style={{ color: primaryColor }} />
                <span>Garantia</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroRenderer;
