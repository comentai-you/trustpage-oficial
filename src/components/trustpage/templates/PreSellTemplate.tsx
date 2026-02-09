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
    // Cookie Wall
    layoutType = 'default',
    cookieBackgroundImageUrl,
    cookieCardPosition = 'center',
    cookieCardTheme = 'light',
    cookieBodyText,
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

  // =========== COOKIE WALL LAYOUT ===========
  if (layoutType === 'cookie-wall') {
    const isDarkTheme = cookieCardTheme === 'dark';
    const cardBg = isDarkTheme ? 'bg-gray-900/95' : 'bg-white/95';
    const cardText = isDarkTheme ? 'text-white' : 'text-gray-900';
    const cardSubtext = isDarkTheme ? 'text-gray-300' : 'text-gray-600';
    
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Add custom shake keyframes */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
        `}</style>

        {/* Background Image with Blur */}
        {cookieBackgroundImageUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${cookieBackgroundImageUrl})`,
              filter: 'blur(8px)',
              transform: 'scale(1.05)', // Prevent blur edges from showing
            }}
          />
        ) : (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: '#1a1a2e' }}
          />
        )}
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Cookie Consent Card */}
        <div className={`flex-1 flex ${cookieCardPosition === 'bottom' ? 'items-end' : 'items-center'} justify-center relative z-10 ${isMobile ? 'px-4 py-6' : 'px-8 py-12'}`}>
          <motion.div
            initial={{ opacity: 0, y: cookieCardPosition === 'bottom' ? 50 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`
              ${cardBg} backdrop-blur-md rounded-2xl shadow-2xl
              ${cookieCardPosition === 'bottom' ? 'w-full' : 'max-w-lg w-full'}
              ${isMobile ? 'p-5' : 'p-8'}
              border border-white/10
            `}
          >
            {/* Cookie Icon */}
            <div className={`flex items-center gap-3 mb-4 ${cookieCardPosition === 'bottom' && !isMobile ? 'flex-row' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkTheme ? 'bg-primary/20' : 'bg-primary/10'}`}>
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                  <circle cx="7" cy="8" r="1.5" />
                  <circle cx="12" cy="7" r="1" />
                  <circle cx="10" cy="12" r="1.5" />
                  <circle cx="13" cy="11" r="1" />
                </svg>
              </div>
              <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} ${cardText}`}>
                {headline || 'Aviso de Privacidade'}
              </h2>
            </div>

            {/* Body Text */}
            <p className={`${cardSubtext} ${isMobile ? 'text-sm' : 'text-base'} mb-6 leading-relaxed`}>
              {cookieBodyText || 'Este site utiliza cookies para garantir que você tenha a melhor experiência. Ao continuar, você concorda com nossa política de privacidade.'}
            </p>

            {/* CTA Button */}
            {(showButton || isPreview) && (
              <motion.div
                initial={!isPreview && ctaDelaySeconds > 0 ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cookieCardPosition === 'bottom' && !isMobile ? 'flex justify-end' : ''}
              >
                <a
                  href={isPreview ? '#' : ctaUrl}
                  onClick={(e) => isPreview && e.preventDefault()}
                  className={`
                    inline-flex items-center justify-center
                    font-bold text-white rounded-xl
                    transition-all duration-300 hover:scale-105 hover:shadow-xl
                    ${cookieCardPosition === 'bottom' && !isMobile ? 'px-8 py-3 text-base' : getButtonSizeClasses(ctaSize, isMobile)}
                    ${getAnimationClass()}
                  `}
                  style={{ backgroundColor: ctaColor }}
                >
                  {ctaText || 'Aceitar e Continuar'}
                </a>
              </motion.div>
            )}

            {/* Timer indicator in preview */}
            {isPreview && ctaDelaySeconds > 0 && (
              <p className={`text-center text-xs opacity-60 mt-4 ${cardSubtext}`}>
                ⏱️ Botão aparece após {ctaDelaySeconds}s
              </p>
            )}

            {/* Privacy Link */}
            <p className={`text-xs ${cardSubtext} opacity-70 mt-4 text-center`}>
              Ao clicar em aceitar, você concorda com nossos termos.
            </p>
          </motion.div>
        </div>

        {/* Legal Footer */}
        <LegalFooter textColor="#ffffff" showWatermark={true} ownerPlan={ownerPlan} />
      </div>
    );
  }

  // =========== DEFAULT LAYOUT ===========
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
