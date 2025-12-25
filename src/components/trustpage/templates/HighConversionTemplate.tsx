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
      {/* Container - Full width, content centered */}
      <article className="mx-auto w-full min-h-screen flex flex-col">
        
        {/* Scarcity Timer - Top bar */}
        <div 
          className="w-full py-2 sm:py-3 px-4 text-center"
          style={{ backgroundColor: `${data.colors.buttonBg}20` }}
        >
          <p className="text-xs sm:text-sm font-medium">
            ⏰ Esta oferta expira em{' '}
            <span 
              className="font-bold"
              style={{ color: data.colors.buttonBg }}
            >
              {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </p>
        </div>

        {/* Main Content - Centered with max width */}
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Headline - Top position */}
          <div className="pt-6 sm:pt-10 lg:pt-12 pb-2">
            <h1 
              className="font-extrabold leading-tight text-center uppercase tracking-wide"
              style={{ 
                color: data.colors.text,
                fontSize: `clamp(1.25rem, ${headlineSize * 0.8}rem, ${headlineSize}rem)`,
                lineHeight: 1.15
              }}
            >
              {data.headline || 'Seu Título Aqui'}
            </h1>
          </div>

          {/* Description - Below title */}
          {data.description && (
            <div className="pb-4 sm:pb-6 lg:pb-8">
              <p 
                className="text-center leading-relaxed opacity-80 text-sm sm:text-base"
              >
                {data.description}
              </p>
            </div>
          )}

          {/* Video Section */}
          <div className="w-full mb-4 sm:mb-6">
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
                {/* Play Button - Circular outline style */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center border-3 sm:border-4 transition-transform group-hover:scale-110"
                    style={{ 
                      borderColor: data.colors.buttonBg,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <Play 
                      className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ml-1" 
                      style={{ color: data.colors.buttonBg }}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Fake Video Controls Bar - Bottom */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 lg:h-14 flex items-center px-2 sm:px-3 gap-1 sm:gap-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                >
                  {/* Play/Pause */}
                  <Play 
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" 
                    style={{ color: data.colors.buttonBg }}
                    fill={data.colors.buttonBg}
                  />
                  
                  {/* Skip */}
                  <SkipForward 
                    className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                    style={{ color: data.colors.buttonBg }}
                  />

                  {/* Progress bar */}
                  <div className="flex-1 h-1 sm:h-1.5 rounded-full bg-gray-600 relative mx-1 sm:mx-2">
                    <div 
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{ 
                        width: '0%',
                        backgroundColor: data.colors.buttonBg
                      }}
                    />
                    {/* Progress dot */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                      style={{ 
                        left: '0%',
                        backgroundColor: data.colors.buttonBg
                      }}
                    />
                  </div>

                  {/* Time */}
                  <span className="text-white text-[10px] sm:text-xs lg:text-sm font-mono">0:00</span>

                  {/* Volume */}
                  <Volume2 
                    className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                    style={{ color: data.colors.buttonBg }}
                  />

                  {/* Settings - Hidden on very small screens */}
                  <Settings 
                    className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 hidden sm:block"
                    style={{ color: data.colors.buttonBg }}
                  />

                  {/* Fullscreen */}
                  <Maximize 
                    className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                    style={{ color: data.colors.buttonBg }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CTA Button - Close to video */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={handleCtaClick}
              className="w-full py-3 sm:py-4 lg:py-5 rounded-xl font-bold text-sm sm:text-base lg:text-lg shadow-lg transition-all active:scale-95 hover:opacity-90 uppercase tracking-wide"
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
        <div className="py-4 sm:py-6 lg:py-8 text-center mt-auto">
          <p 
            className="text-[10px] sm:text-xs lg:text-sm font-medium tracking-wide"
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
