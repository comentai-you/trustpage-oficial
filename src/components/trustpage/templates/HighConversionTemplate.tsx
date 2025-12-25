import { useState, useEffect, useRef } from "react";
import { LandingPageFormData } from "@/types/landing-page";
import { Play, Maximize2, Minimize2 } from "lucide-react";

interface HighConversionTemplateProps {
  data: LandingPageFormData;
  isMobile?: boolean;
  /**
   * Quando true, o template ocupa pelo menos a altura do viewport (página real).
   * Quando false, ocupa apenas a altura do container pai (mockups do editor).
   */
  fullHeight?: boolean;
}

const HighConversionTemplate = ({
  data,
  isMobile = false,
  fullHeight = true,
}: HighConversionTemplateProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });
  const [videoProgress, setVideoProgress] = useState(0);
  const [showCta, setShowCta] = useState(!data.cta_delay_enabled);
  const videoContainerRef = useRef<HTMLDivElement>(null);

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

  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const headlineSizeMobile = data.headline_size_mobile || 1.2;
  const headlineSizeDesktop = data.headline_size_desktop || 2.5;
  const currentHeadlineSize = isMobile ? headlineSizeMobile : headlineSizeDesktop;

  return (
    <main
      className={`${fullHeight ? "min-h-screen" : "h-full min-h-0"} w-full flex flex-col`}
      style={{
        backgroundColor: data.colors.background,
        color: data.colors.text,
      }}
    >
      {/* Scarcity Timer - Compact top bar */}
      <header
        className="w-full py-2 px-4 text-center flex-shrink-0"
        style={{ backgroundColor: `${data.colors.buttonBg}15` }}
      >
        <p className="text-xs md:text-sm font-medium">
          ⏰ Esta oferta expira em{" "}
          <span className="font-bold" style={{ color: data.colors.buttonBg }}>
            {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </p>
      </header>

      {/* Main Content (vertically centered between header and footer) */}
      <section className="flex-1 w-full flex items-center justify-center">
        <div className="w-full max-w-2xl px-4 md:px-8 py-6 md:py-10 flex flex-col">
          {/* Headline */}
          <h1
            className="font-extrabold leading-tight text-center uppercase tracking-wide mb-2 md:mb-3"
            style={{
              color: data.colors.text,
              fontSize: isMobile
                ? `${headlineSizeMobile}rem`
                : `clamp(1.5rem, 4vw, ${headlineSizeDesktop}rem)`,
              lineHeight: 1.15,
            }}
          >
            {data.headline || "Seu Título Aqui"}
          </h1>

          {/* Description */}
          {data.description && (
            <p
              className="text-center leading-relaxed opacity-80 text-sm md:text-base mb-4 md:mb-6"
              style={{ color: data.colors.text }}
            >
              {data.description}
            </p>
          )}

          {/* Video Section */}
          <div className="w-full mb-4 md:mb-6">
            {isVideoPlaying && embedUrl ? (
              <div 
                ref={videoContainerRef}
                className={`relative w-full rounded-lg overflow-hidden shadow-xl ${isFullscreen ? "bg-black" : "aspect-video"}`}
              >
                <iframe
                  src={embedUrl}
                  className={`w-full ${isFullscreen ? "h-screen" : "h-full absolute inset-0"}`}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                {/* Fullscreen toggle button */}
                <button
                  onClick={toggleFullscreen}
                  className="absolute bottom-3 right-3 z-10 p-2 rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
                  title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            ) : (
              <div
                className="aspect-video w-full relative cursor-pointer group rounded-lg overflow-hidden shadow-lg"
                onClick={handlePlayClick}
                style={{ backgroundColor: `${data.colors.text}10` }}
              >
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: data.colors.buttonBg,
                    }}
                  >
                    <Play
                      className="w-7 h-7 md:w-9 md:h-9 ml-1"
                      style={{ color: data.colors.buttonText }}
                      fill={data.colors.buttonText}
                    />
                  </div>
                </div>

                {/* Fake progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/20">
                  <div className="h-full w-0" style={{ backgroundColor: data.colors.buttonBg }} />
                </div>
              </div>
            )}
          </div>

          {/* CTA Button */}
          {showCta && (
            <button
              onClick={handleCtaClick}
              className="w-full py-4 md:py-5 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all active:scale-[0.98] hover:opacity-90 uppercase tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{
                backgroundColor: data.colors.buttonBg,
                color: data.colors.buttonText,
                boxShadow: `0 8px 25px ${data.colors.buttonBg}50`,
              }}
            >
              {data.cta_text || "QUERO AGORA"}
            </button>
          )}
        </div>
      </section>

      {/* Watermark */}
      <footer className="w-full py-6 text-center">
        <p className="text-xs font-medium tracking-wide" style={{ opacity: 0.4, color: data.colors.text }}>
          ✨ Criado com <span className="font-bold">TrustPage</span>
        </p>
      </footer>
    </main>
  );
};

export default HighConversionTemplate;
