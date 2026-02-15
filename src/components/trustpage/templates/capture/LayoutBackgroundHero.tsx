import { LandingPageFormData } from "@/types/landing-page";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import LegalFooter from "../LegalFooter";
import CaptureFormInputs from "./CaptureFormInputs";
import CaptureSuccessScreen from "./CaptureSuccessScreen";
import { useCaptureForm } from "./useCaptureForm";
import { extractCaptureData } from "./captureDataHelpers";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  data: LandingPageFormData;
  isMobile?: boolean;
  fullHeight?: boolean;
  pageId?: string;
  ownerPlan?: string | null;
}

const LayoutBackgroundHero = ({ data, isMobile, fullHeight, pageId, ownerPlan }: Props) => {
  const d = extractCaptureData(data);
  const { formData, isSubmitting, isSuccess, isDownloading, handleInputChange, handleSubmit, handleDownload } =
    useCaptureForm({ pageId, ctaUrl: data.cta_url, formFields: d.formFields, magnetConfig: d.magnetConfig });

  const deviceIsMobile = useIsMobile();
  const effectiveIsMobile = isMobile ?? deviceIsMobile;

  // Background images: desktop and mobile from content, fallback to image_url
  const bgImageDesktop = (data.content as any)?.bgHeroImageDesktop || '';
  const bgImageMobile = (data.content as any)?.bgHeroImageMobile || bgImageDesktop;
  const bgImage = effectiveIsMobile ? bgImageMobile : bgImageDesktop;
  const hasImage = !!bgImage;

  return (
    <div
      className="relative w-full overflow-x-hidden"
      style={{
        minHeight: fullHeight ? '100vh' : 'auto',
        backgroundColor: d.bgStart.includes('linear') ? '#111827' : d.bgStart,
      }}
    >
      {/* Background image - covers 100% */}
      {hasImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: hasImage
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 100%)'
            : d.isGradientBg ? `${d.bgStart}` : `linear-gradient(135deg, ${d.bgStart} 0%, ${d.bgEnd}40 100%)`,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 w-full flex flex-col items-center justify-center px-4 py-12 md:py-20"
        style={{ minHeight: fullHeight ? '100vh' : 'auto' }}
      >
        {/* Badge */}
        {data.subheadline && (
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
            style={{
              backgroundColor: `${d.accentColor}25`,
              color: hasImage ? '#ffffff' : d.labelColor,
              border: `1px solid ${d.accentColor}50`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {data.subheadline}
          </span>
        )}

        {/* Big headline */}
        <h1
          className="font-extrabold leading-tight text-center max-w-3xl mb-4"
          style={{
            color: hasImage ? '#ffffff' : d.headlineColor,
            fontSize: isMobile ? `${d.headlineSizeMobile * 1.1}rem` : `${d.headlineSizeDesktop * 1.1}rem`,
            lineHeight: 1.1,
            textShadow: hasImage ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {data.headline || "Sua Headline Impactante Vai Aqui"}
        </h1>

        {data.description && (
          <p
            className="text-center max-w-lg mb-8 text-base md:text-lg"
            style={{ color: hasImage ? 'rgba(255,255,255,0.85)' : d.descriptionColor }}
          >
            {data.description}
          </p>
        )}

        {/* Form card with subtle glass */}
        <div
          className="w-full max-w-md rounded-2xl p-6 md:p-8"
          style={{
            backgroundColor: hasImage ? 'rgba(255,255,255,0.1)' : `${d.accentColor}08`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: hasImage ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${d.accentColor}20`,
            boxShadow: hasImage ? '0 20px 40px rgba(0,0,0,0.3)' : `0 20px 40px ${d.accentColor}10`,
          }}
        >
          {isSuccess ? (
            <CaptureSuccessScreen
              accentColor={d.accentColor}
              textColor={hasImage ? '#ffffff' : d.textColor}
              isDownloading={isDownloading}
              onDownload={handleDownload}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <CaptureFormInputs
                formFields={d.formFields}
                formData={formData}
                onInputChange={handleInputChange}
                textColor={hasImage ? '#ffffff' : d.textColor}
                placeholderColor={hasImage ? 'rgba(255,255,255,0.5)' : d.placeholderColor}
                inputBgColor={hasImage ? 'rgba(255,255,255,0.1)' : `${d.accentColor}08`}
                inputBorderColor={hasImage ? 'rgba(255,255,255,0.2)' : `${d.accentColor}20`}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-base font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${d.accentColor} 0%, ${d.accentColor}cc 100%)`,
                  color: d.buttonTextColor,
                  boxShadow: `0 10px 30px -10px ${d.accentColor}80`,
                }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <>
                    {data.cta_text || "GARANTIR MEU LUGAR AGORA!"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs" style={{ color: hasImage ? 'rgba(255,255,255,0.4)' : `${d.textColor}60` }}>
                🔒 Seus dados estão 100% seguros
              </p>
            </form>
          )}
        </div>
      </div>

      <LegalFooter textColor={hasImage ? 'rgba(255,255,255,0.6)' : `${d.textColor}99`} showWatermark={true} ownerPlan={ownerPlan} />
    </div>
  );
};

export default LayoutBackgroundHero;
