import { useState, useEffect } from "react";
import { LandingPageFormData } from "@/types/landing-page";
import { Play, SkipForward, Volume2, Settings, Maximize } from "lucide-react";

interface HighConversionTemplateProps {
  data: LandingPageFormData;
}

const HighConversionTemplate = ({ data }: HighConversionTemplateProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const embedUrl = getVideoEmbedUrl(data.video_url, isVideoPlaying);

  const handlePlayClick = () => {
    setIsVideoPlaying(true);
  };

  const handleCtaClick = () => {
    if (data.cta_url) {
      window.open(data.cta_url, '_blank');
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
      {/* Container - Mobile: full width, Desktop: max 800px */}
      <article className="mx-auto w-full max-w-[800px] min-h-screen flex flex-col">
        
        {/* Scarcity Timer - Top bar */}
        <div 
          className="w-full py-3 px-4 text-center"
          style={{ backgroundColor: `${data.colors.buttonBg}20` }}
        >
          <p className="text-sm font-medium">
            ⏰ Esta oferta expira em{' '}
            <span 
              className="font-bold"
              style={{ color: data.colors.buttonBg }}
            >
              {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col px-4 md:px-8 lg:px-12">
          
          {/* Headline - Top position like reference */}
          <div className="pt-8 pb-2 md:pt-12">
            <h1 
              className="font-extrabold leading-tight text-center uppercase tracking-wide"
              style={{ 
                color: data.colors.text,
                fontSize: `clamp(1.5rem, ${headlineSize}rem, 3rem)`,
                lineHeight: 1.15
              }}
            >
              {data.headline || 'Seu Título Aqui'}
            </h1>
          </div>

          {/* Description - Below title */}
          {data.description && (
            <div className="pb-6 md:pb-8">
              <p 
                className="text-center leading-relaxed opacity-80"
                style={{ fontSize: 'clamp(0.875rem, 1rem, 1.125rem)' }}
              >
                {data.description}
              </p>
            </div>
          )}

          {/* Video Section - Larger on desktop */}
          <div className="w-full mb-6">
            {isVideoPlaying && embedUrl ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <div 
                className="aspect-video w-full relative cursor-pointer group rounded-lg overflow-hidden"
                onClick={handlePlayClick}
                style={{ backgroundColor: `${data.colors.text}10` }}
              >
                {/* Play Button - Circular outline style like reference */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-4 transition-transform group-hover:scale-110"
                    style={{ 
                      borderColor: data.colors.buttonBg,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <Play 
                      className="w-10 h-10 md:w-12 md:h-12 ml-1" 
                      style={{ color: data.colors.buttonBg }}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Fake Video Controls Bar - Bottom */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-12 md:h-14 flex items-center px-3 gap-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                >
                  {/* Play/Pause */}
                  <Play 
                    className="w-5 h-5 md:w-6 md:h-6" 
                    style={{ color: data.colors.buttonBg }}
                    fill={data.colors.buttonBg}
                  />
                  
                  {/* Skip */}
                  <SkipForward 
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ color: data.colors.buttonBg }}
                  />

                  {/* Progress bar */}
                  <div className="flex-1 h-1 md:h-1.5 rounded-full bg-gray-600 relative mx-2">
                    <div 
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{ 
                        width: '0%',
                        backgroundColor: data.colors.buttonBg
                      }}
                    />
                    {/* Progress dot */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                      style={{ 
                        left: '0%',
                        backgroundColor: data.colors.buttonBg
                      }}
                    />
                  </div>

                  {/* Time */}
                  <span className="text-white text-xs md:text-sm font-mono">0:00</span>

                  {/* Volume */}
                  <Volume2 
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ color: data.colors.buttonBg }}
                  />

                  {/* Settings */}
                  <Settings 
                    className="w-4 h-4 md:w-5 md:h-5 hidden md:block"
                    style={{ color: data.colors.buttonBg }}
                  />

                  {/* Fullscreen */}
                  <Maximize 
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ color: data.colors.buttonBg }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CTA Button - Close to video */}
          <div className="mb-8">
            <button
              onClick={handleCtaClick}
              className="w-full py-4 md:py-5 rounded-xl font-bold text-base md:text-lg shadow-lg transition-all active:scale-95 hover:opacity-90 uppercase tracking-wide"
              style={{ 
                backgroundColor: data.colors.buttonBg, 
                color: data.colors.buttonText,
                boxShadow: `0 4px 20px ${data.colors.buttonBg}50`
              }}
            >
              {data.cta_text || 'QUERO AGORA'}
            </button>
          </div>
        </div>

        {/* Spacer to push watermark to bottom */}
        <div className="flex-1" />

        {/* Watermark Footer - Distant from everything */}
        <div className="py-6 md:py-8 text-center mt-auto">
          <p 
            className="text-xs md:text-sm font-medium tracking-wide"
            style={{ opacity: 0.5, color: data.colors.text }}
          >
            ✨ Criado com <span className="font-bold">TrustPage</span>
          </p>
        </div>
      </article>
    </main>
  );
};

export default HighConversionTemplate;
