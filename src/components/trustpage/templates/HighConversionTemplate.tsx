import { useState, useEffect, useRef, useCallback } from "react";
import { LandingPageFormData } from "@/types/landing-page";
import { Play, Maximize2 } from "lucide-react";
import LegalFooter from "./LegalFooter";
// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface HighConversionTemplateProps {
  data: LandingPageFormData;
  isMobile?: boolean;
  fullHeight?: boolean;
  ownerPlan?: string | null;
}

const HighConversionTemplate = ({
  data,
  isMobile = false,
  fullHeight = true,
  ownerPlan,
}: HighConversionTemplateProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });
  const [showCta, setShowCta] = useState(!data.cta_delay_enabled);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get video ID and type with strict domain validation
  const getVideoInfo = useCallback((url: string) => {
    if (!url) return null;
    
    try {
      const parsed = new URL(url);
      
      // Strict YouTube domain validation
      const youtubeHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'];
      if (youtubeHosts.includes(parsed.hostname)) {
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (!youtubeMatch) return null;
        return { type: 'youtube', id: youtubeMatch[1] };
      }
      
      // Strict Vimeo domain validation
      const vimeoHosts = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];
      if (vimeoHosts.includes(parsed.hostname)) {
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (!vimeoMatch) return null;
        return { type: 'vimeo', id: vimeoMatch[1] };
      }
      
      return null;
    } catch {
      return null;
    }
  }, []);

  const videoInfo = getVideoInfo(data.video_url);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isVideoPlaying || !data.cta_delay_enabled || videoInfo?.type !== 'youtube') return;

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!iframeRef.current || playerRef.current) return;
      
      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onReady: (event: any) => {
            const duration = event.target.getDuration();
            console.log(`YouTube video duration: ${duration} seconds`);
            setVideoDuration(duration);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1
            if (event.data === 1) {
              startProgressTracking();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      // Small delay to ensure iframe is mounted
      setTimeout(initPlayer, 500);
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isVideoPlaying, data.cta_delay_enabled, videoInfo?.type]);

  // For Vimeo - use postMessage API
  useEffect(() => {
    if (!isVideoPlaying || !data.cta_delay_enabled || videoInfo?.type !== 'vimeo') return;

    const handleVimeoMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://player.vimeo.com') return;
      
      try {
        const messageData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (messageData.event === 'ready') {
          // Request duration
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ method: 'getDuration' }), 
            '*'
          );
          // Request progress updates
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ method: 'addEventListener', value: 'playProgress' }), 
            '*'
          );
        }
        
        if (messageData.method === 'getDuration') {
          console.log(`Vimeo video duration: ${messageData.value} seconds`);
          setVideoDuration(messageData.value);
        }
        
        if (messageData.event === 'playProgress' && messageData.data) {
          const progress = messageData.data.percent * 100;
          checkCtaVisibility(progress);
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleVimeoMessage);
    
    // Send ready check after iframe loads
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ method: 'addEventListener', value: 'ready' }), 
        '*'
      );
    }, 1000);

    return () => window.removeEventListener('message', handleVimeoMessage);
  }, [isVideoPlaying, data.cta_delay_enabled, videoInfo?.type]);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;
    
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          const progress = (currentTime / duration) * 100;
          checkCtaVisibility(progress);
        }
      }
    }, 1000);
  }, []);

  const checkCtaVisibility = useCallback((progress: number) => {
    const targetPercentage = data.cta_delay_percentage || 50;
    if (progress >= targetPercentage && !showCta) {
      console.log(`Video progress ${progress.toFixed(1)}% reached target ${targetPercentage}% - showing CTA`);
      setShowCta(true);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [data.cta_delay_percentage, showCta]);

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

  // Update CTA visibility when delay is disabled
  useEffect(() => {
    if (!data.cta_delay_enabled) {
      setShowCta(true);
    } else {
      setShowCta(false);
    }
  }, [data.cta_delay_enabled]);

  const getVideoEmbedUrl = (url: string, autoplay = false) => {
    if (!url) return null;
    
    try {
      const parsed = new URL(url);
      
      // YouTube - Strict domain validation + Chromeless mode
      const youtubeHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'];
      if (youtubeHosts.includes(parsed.hostname)) {
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (!youtubeMatch) return null;
        const videoId = youtubeMatch[1];
        const baseParams = `controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
        const params = autoplay 
          ? `?autoplay=1&playsinline=1&${baseParams}`
          : `?${baseParams}`;
        return `https://www.youtube.com/embed/${videoId}${params}`;
      }
      
      // Vimeo - Strict domain validation + Chromeless mode
      const vimeoHosts = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];
      if (vimeoHosts.includes(parsed.hostname)) {
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (!vimeoMatch) return null;
        const videoId = vimeoMatch[1];
        const baseParams = 'controls=0&title=0&byline=0&portrait=0&sidedock=0&api=1';
        const params = autoplay
          ? `?autoplay=1&${baseParams}`
          : `?${baseParams}`;
        return `https://player.vimeo.com/video/${videoId}${params}`;
      }
      
      // Reject all other domains
      return null;
    } catch {
      return null;
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoContainer.requestFullscreen();
      }
    }
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
                id="video-container"
                className="relative w-full rounded-lg overflow-hidden shadow-xl aspect-video group"
              >
                {/* Video iframe */}
                <iframe
                  ref={iframeRef}
                  id="video-player"
                  src={embedUrl}
                  className="w-full h-full absolute inset-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                
                {/* Click Shield - prevents pausing by clicking on video */}
                <div 
                  className="absolute inset-0 z-10"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.preventDefault()}
                />
                
                {/* Fullscreen button - positioned above the shield */}
                <button
                  onClick={handleFullscreen}
                  className="absolute bottom-3 right-3 z-20 p-2 rounded-lg bg-black/60 hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
                  style={{ pointerEvents: 'auto' }}
                  title="Tela cheia"
                >
                  <Maximize2 className="w-5 h-5 text-white" />
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

      {/* Legal Footer */}
      <LegalFooter textColor={data.colors.text} showWatermark={true} ownerPlan={ownerPlan} />
    </main>
  );
};

export default HighConversionTemplate;
