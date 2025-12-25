import { useState, useEffect } from "react";
import { LandingPageFormData } from "@/types/landing-page";
import { Play } from "lucide-react";

interface HighConversionTemplateProps {
  data: LandingPageFormData;
  isMobile?: boolean;
}

const HighConversionTemplate = ({ data, isMobile = false }: HighConversionTemplateProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });
  const [videoProgress, setVideoProgress] = useState(0);
  const [showCta, setShowCta] = useState(!data.cta_delay_enabled);

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

  // Update CTA visibility based on video progress
  useEffect(() => {
    if (!data.cta_delay_enabled) {
      setShowCta(true);
      return;
    }
    
    const targetPercentage = data.cta_delay_percentage || 50;
    if (videoProgress >= targetPercentage) {
      setShowCta(true);
    }
  }, [videoProgress, data.cta_delay_enabled, data.cta_delay_percentage]);

  // Listen for postMessage from YouTube/Vimeo iframes for progress tracking
  useEffect(() => {
    if (!data.cta_delay_enabled || !isVideoPlaying) return;

    const handleMessage = (event: MessageEvent) => {
      // YouTube API messages
      if (event.origin === 'https://www.youtube.com') {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data.event === 'infoDelivery' && data.info?.currentTime && data.info?.duration) {
            const progress = (data.info.currentTime / data.info.duration) * 100;
            setVideoProgress(progress);
          }
        } catch (e) {}
      }
      
      // Vimeo API messages
      if (event.origin === 'https://player.vimeo.com') {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data.method === 'playProgress' && data.value?.percent) {
            setVideoProgress(data.value.percent * 100);
          }
        } catch (e) {}
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [data.cta_delay_enabled, isVideoPlaying]);

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

  const headlineSizeMobile = data.headline_size_mobile || 1.2;
  const headlineSizeDesktop = data.headline_size_desktop || 2.5;
  const currentHeadlineSize = isMobile ? headlineSizeMobile : headlineSizeDesktop;

  return (
    <main
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundColor: data.colors.background,
        color: data.colors.text,
        minHeight: '100%',
      }}
    >
      {/* Scarcity Timer - Compact top bar */}
      <div 
        className="w-full py-2 px-3 text-center flex-shrink-0"
        style={{ backgroundColor: `${data.colors.buttonBg}20` }}
      >
        <p className="text-[10px] sm:text-xs font-medium">
          ⏰ Esta oferta expira em{' '}
          <span 
            className="font-bold"
            style={{ color: data.colors.buttonBg }}
          >
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </p>
      </div>

      {/* Main Content - Compact spacing */}
      <div className="flex-1 flex flex-col px-4 sm:px-6">
        
        {/* Headline */}
        <div className="pt-4 sm:pt-6 pb-1 sm:pb-2">
          <h1 
            className="font-extrabold leading-tight text-center uppercase tracking-wide"
            style={{ 
              color: data.colors.text,
              fontSize: `${currentHeadlineSize}rem`,
              lineHeight: 1.1
            }}
          >
            {data.headline || 'Seu Título Aqui'}
          </h1>
        </div>

        {/* Description */}
        {data.description && (
          <div className="pb-3 sm:pb-4">
            <p className="text-center leading-snug opacity-80 text-[11px] sm:text-sm">
              {data.description}
            </p>
          </div>
        )}

        {/* Video Section - Clean play button like landing page mockup */}
        <div className="w-full mb-4 sm:mb-5">
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
              style={{ backgroundColor: `${data.colors.text}08` }}
            >
              {/* Play Button - Clean circular style like the landing page mockup */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: data.colors.buttonBg,
                  }}
                >
                  <Play 
                    className="w-6 h-6 sm:w-8 sm:h-8 ml-0.5" 
                    style={{ color: data.colors.buttonText }}
                    fill={data.colors.buttonText}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        {showCta && (
          <button
            onClick={handleCtaClick}
            className="w-full py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-95 hover:opacity-90 uppercase tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ 
              backgroundColor: data.colors.buttonBg, 
              color: data.colors.buttonText,
              boxShadow: `0 4px 15px ${data.colors.buttonBg}40`
            }}
          >
            {data.cta_text || 'QUERO AGORA'}
          </button>
        )}

        {/* Watermark - Right below CTA, not at bottom of page */}
        <div className="py-4 sm:py-5 text-center">
          <p 
            className="text-[9px] sm:text-xs font-medium tracking-wide"
            style={{ opacity: 0.5, color: data.colors.text }}
          >
            ✨ Criado com <span className="font-bold">TrustPage</span>
          </p>
        </div>
      </div>
    </main>
  );
};

export default HighConversionTemplate;
