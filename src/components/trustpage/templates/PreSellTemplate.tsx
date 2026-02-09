import { PresellContent, PresellButtonSize } from "@/types/landing-page";
import { motion } from "framer-motion";
import LegalFooter from "./LegalFooter";

interface PreSellTemplateProps {
  content: PresellContent;
  isMobile?: boolean;
  isPreview?: boolean;
  ownerPlan?: string | null;
}

const PreSellTemplate = ({ content, isMobile = false, isPreview = false, ownerPlan }: PreSellTemplateProps) => {
  const {
    headline,
    subheadline,
    mediaType,
    mediaUrl,
    ctaText,
    ctaUrl,
    ctaColor,
    ctaAnimation,
    ctaDelaySeconds,
    ctaSize = 'large',
    backgroundColor,
    backgroundType,
    gradientStart,
    gradientEnd,
    textColor,
    cardStyleEnabled,
  } = content;

  // For preview, always show button. In real view, respect delay
  const showButton = isPreview || ctaDelaySeconds === 0;

  // Parse video URL for embed
  const getVideoEmbed = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Panda Video
    if (url.includes('pandavideo') || url.includes('player-vz')) {
      return url;
    }
    
    return url;
  };

  const backgroundStyle = backgroundType === 'gradient' 
    ? { background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)` }
    : { backgroundColor };

  const getAnimationClass = () => {
    switch (ctaAnimation) {
      case 'pulse':
        return 'animate-pulse';
      case 'shake':
        return 'animate-[shake_0.5s_ease-in-out_infinite]';
      default:
        return '';
    }
  };

  const getButtonSizeClasses = (size: PresellButtonSize, mobile: boolean) => {
    if (mobile) {
      switch (size) {
        case 'small':
          return 'px-6 py-3 text-sm w-full';
        case 'medium':
          return 'px-8 py-4 text-base w-full';
        case 'large':
          return 'px-10 py-5 text-lg w-full';
      }
    }
    switch (size) {
      case 'small':
        return 'px-10 py-4 text-lg';
      case 'medium':
        return 'px-14 py-5 text-xl min-w-[320px]';
      case 'large':
        return 'px-16 py-6 text-2xl min-w-[400px]';
    }
  };

  const containerPadding = isMobile ? 'px-4 py-8' : 'px-8 py-16';

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={backgroundStyle}
    >
      {/* Add custom shake keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
      `}</style>

      <div className={`flex-1 flex flex-col items-center justify-center ${containerPadding}`}>
        {/* Card wrapper if enabled */}
        <div className={`w-full max-w-2xl ${cardStyleEnabled ? 'bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-10' : ''}`}>
          
          {/* Headline */}
          <h1 
            className={`font-bold text-center mb-4 ${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'}`}
            style={{ color: textColor }}
          >
            {headline}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p 
              className={`text-center opacity-80 mb-8 ${isMobile ? 'text-sm' : 'text-lg'}`}
              style={{ color: textColor }}
            >
              {subheadline}
            </p>
          )}

          {/* Media Section */}
          {mediaType !== 'none' && mediaUrl && (
            <div className="w-full mb-8">
              {mediaType === 'video' ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={getVideoEmbed(mediaUrl) || ''}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video"
                  />
                </div>
              ) : (
                <img 
                  src={mediaUrl} 
                  alt="Featured" 
                  className="w-full rounded-xl shadow-2xl object-cover max-h-[400px]"
                />
              )}
            </div>
          )}

          {/* CTA Button */}
          {(showButton || isPreview) && (
            <motion.div
              initial={!isPreview && ctaDelaySeconds > 0 ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <a
                href={isPreview ? '#' : ctaUrl}
                onClick={(e) => isPreview && e.preventDefault()}
                className={`
                  inline-flex items-center justify-center
                  font-bold text-white rounded-xl
                  transition-all duration-300 hover:scale-105 hover:shadow-xl
                  ${getButtonSizeClasses(ctaSize, isMobile)}
                  ${getAnimationClass()}
                `}
                style={{ backgroundColor: ctaColor }}
              >
                {ctaText}
              </a>
            </motion.div>
          )}

          {/* Timer indicator in preview */}
          {isPreview && ctaDelaySeconds > 0 && (
            <p className="text-center text-xs opacity-60 mt-4" style={{ color: textColor }}>
              ⏱️ Botão aparece após {ctaDelaySeconds}s
            </p>
          )}
        </div>
      </div>

      {/* Legal Footer */}
      <LegalFooter textColor={textColor} showWatermark={true} ownerPlan={ownerPlan} />
    </div>
  );
};

export default PreSellTemplate;
