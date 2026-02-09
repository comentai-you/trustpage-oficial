import { PresellButtonSize, PresellContent } from "@/types/landing-page";
import { motion } from "framer-motion";
import LegalFooter from "../LegalFooter";
import CookieWallBackground from "./CookieWallBackground";

interface PreSellCookieWallTemplateProps {
  content: PresellContent;
  /**
   * Usado apenas para preview em mockups (ScaledViewport).
   * Se omitido, o layout usa classes responsivas (md:...) e o fundo usa <picture>.
   */
  isMobile?: boolean;
  isPreview?: boolean;
  ownerPlan?: string | null;
}

type DeviceMode = "auto" | "mobile" | "desktop";

const PreSellCookieWallTemplate = ({
  content,
  isMobile,
  isPreview = false,
  ownerPlan,
}: PreSellCookieWallTemplateProps) => {
  const {
    headline,
    ctaText,
    ctaUrl,
    ctaColor,
    ctaAnimation,
    ctaDelaySeconds,
    ctaSize = "large",
    cookieBackgroundImageUrl, // legacy
    cookieBackgroundImageDesktop = "",
    cookieBackgroundImageMobile = "",
    cookieCardPosition = "center",
    cookieCardTheme = "light",
    cookieBodyText,
    backgroundColor,
  } = content;

  const deviceMode: DeviceMode =
    typeof isMobile === "boolean" ? (isMobile ? "mobile" : "desktop") : "auto";

  const desktopBg = cookieBackgroundImageDesktop || cookieBackgroundImageUrl || "";
  const mobileBg = cookieBackgroundImageMobile || desktopBg;

  // For preview, always show button. In real view, respect delay
  const showButton = isPreview || ctaDelaySeconds === 0;

  const isDarkTheme = cookieCardTheme === "dark";
  const cardBg = isDarkTheme ? "bg-gray-900/95" : "bg-white/95";
  const cardText = isDarkTheme ? "text-white" : "text-gray-900";
  const cardSubtext = isDarkTheme ? "text-gray-300" : "text-gray-600";

  const outerPadding =
    deviceMode === "mobile"
      ? "px-4 py-6"
      : deviceMode === "desktop"
        ? "px-8 py-12"
        : "px-4 py-6 md:px-8 md:py-12";

  const cardPadding =
    deviceMode === "mobile"
      ? "p-5"
      : deviceMode === "desktop"
        ? "p-8"
        : "p-5 md:p-8";

  const titleSize =
    deviceMode === "mobile"
      ? "text-lg"
      : deviceMode === "desktop"
        ? "text-xl"
        : "text-lg md:text-xl";

  const bodySize =
    deviceMode === "mobile"
      ? "text-sm"
      : deviceMode === "desktop"
        ? "text-base"
        : "text-sm md:text-base";

  const getAnimationClass = () => {
    switch (ctaAnimation) {
      case "pulse":
        return "animate-pulse";
      case "shake":
        return "animate-[shake_0.5s_ease-in-out_infinite]";
      default:
        return "";
    }
  };

  const getButtonSizeClasses = (size: PresellButtonSize) => {
    // Preview forçado no mockup
    if (deviceMode === "mobile") {
      switch (size) {
        case "small":
          return "px-6 py-3 text-sm w-full";
        case "medium":
          return "px-8 py-4 text-base w-full";
        case "large":
          return "px-10 py-5 text-lg w-full";
      }
    }

    if (deviceMode === "desktop") {
      switch (size) {
        case "small":
          return "px-10 py-4 text-lg";
        case "medium":
          return "px-14 py-5 text-xl min-w-[320px]";
        case "large":
          return "px-16 py-6 text-2xl min-w-[400px]";
      }
    }

    // Auto (site real) -> responsivo por CSS
    switch (size) {
      case "small":
        return "px-6 py-3 text-sm w-full md:w-auto md:px-10 md:py-4 md:text-lg";
      case "medium":
        return "px-8 py-4 text-base w-full md:w-auto md:px-14 md:py-5 md:text-xl md:min-w-[320px]";
      case "large":
        return "px-10 py-5 text-lg w-full md:w-auto md:px-16 md:py-6 md:text-2xl md:min-w-[400px]";
    }
  };

  const backgroundForceDevice =
    deviceMode === "mobile" ? "mobile" : deviceMode === "desktop" ? "desktop" : undefined;

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
      {desktopBg || mobileBg ? (
        <div className="absolute inset-0">
          <CookieWallBackground
            desktopSrc={desktopBg}
            mobileSrc={mobileBg}
            forceDevice={backgroundForceDevice}
          />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: backgroundColor || "#1a1a2e" }} />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Cookie Consent Card */}
      <div
        className={`flex-1 flex ${cookieCardPosition === "bottom" ? "items-end" : "items-center"} justify-center relative z-10 ${outerPadding}`}
      >
        <motion.div
          initial={{ opacity: 0, y: cookieCardPosition === "bottom" ? 50 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`
            ${cardBg} backdrop-blur-md rounded-2xl shadow-2xl
            ${cookieCardPosition === "bottom" ? "w-full" : "max-w-lg w-full"}
            ${cardPadding}
            border border-white/10
          `}
        >
          {/* Cookie Icon */}
          <div className={`flex items-center gap-3 mb-4 ${cookieCardPosition === "bottom" && deviceMode !== "mobile" ? "flex-row" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkTheme ? "bg-primary/20" : "bg-primary/10"}`}>
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                <circle cx="7" cy="8" r="1.5" />
                <circle cx="12" cy="7" r="1" />
                <circle cx="10" cy="12" r="1.5" />
                <circle cx="13" cy="11" r="1" />
              </svg>
            </div>
            <h1 className={`font-bold ${titleSize} ${cardText}`}>{headline || "Aviso de Privacidade"}</h1>
          </div>

          {/* Body Text */}
          <p className={`${cardSubtext} ${bodySize} mb-6 leading-relaxed`}>
            {cookieBodyText ||
              "Este site utiliza cookies para garantir que você tenha a melhor experiência. Ao continuar, você concorda com nossa política de privacidade."}
          </p>

          {/* CTA Button */}
          {(showButton || isPreview) && (
            <motion.div
              initial={!isPreview && ctaDelaySeconds > 0 ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cookieCardPosition === "bottom" && deviceMode !== "mobile" ? "flex justify-end" : ""}
            >
              <a
                href={isPreview ? "#" : ctaUrl}
                onClick={(e) => isPreview && e.preventDefault()}
                className={`
                  inline-flex items-center justify-center
                  font-bold text-white rounded-xl
                  transition-all duration-300 hover:scale-105 hover:shadow-xl
                  ${cookieCardPosition === "bottom" && deviceMode !== "mobile" ? "px-8 py-3 text-base" : getButtonSizeClasses(ctaSize)}
                  ${getAnimationClass()}
                `}
                style={{ backgroundColor: ctaColor }}
              >
                {ctaText || "Aceitar e Continuar"}
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
};

export default PreSellCookieWallTemplate;
