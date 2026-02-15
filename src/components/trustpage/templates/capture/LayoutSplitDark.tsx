import { LandingPageFormData } from "@/types/landing-page";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import LegalFooter from "../LegalFooter";
import CaptureFormInputs from "./CaptureFormInputs";
import CaptureSuccessScreen from "./CaptureSuccessScreen";
import { useCaptureForm } from "./useCaptureForm";
import { extractCaptureData } from "./captureDataHelpers";

interface Props {
  data: LandingPageFormData;
  isMobile?: boolean;
  fullHeight?: boolean;
  pageId?: string;
  ownerPlan?: string | null;
}

const LayoutSplitDark = ({ data, isMobile, fullHeight, pageId, ownerPlan }: Props) => {
  const d = extractCaptureData(data);
  const { formData, isSubmitting, isSuccess, isDownloading, handleInputChange, handleSubmit, handleDownload } =
    useCaptureForm({ pageId, ctaUrl: data.cta_url, formFields: d.formFields, magnetConfig: d.magnetConfig });

  // Detect if theme is light to adapt form styling
  const isLightTheme = !d.isGradientBg && (
    d.bgStart === '#ffffff' || d.bgStart === '#f8fafc' || d.bgStart === '#fffbeb' ||
    d.bgStart === '#ecfdf5' || d.bgStart === '#fdf2f8' || d.bgStart === '#f0f9ff' ||
    d.bgStart.startsWith('#f') || d.bgStart.startsWith('#e')
  );

  // Form card styling adapts to theme
  const formCardStyle: React.CSSProperties = isLightTheme
    ? {
        backgroundColor: 'rgba(0,0,0,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }
    : {
        backgroundColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      };

  // Form text colors adapt to theme
  const formTextColor = isLightTheme ? d.textColor : '#ffffff';
  const formHeadingColor = isLightTheme ? d.headlineColor : '#ffffff';
  const formInputBg = isLightTheme ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)';
  const formInputBorder = isLightTheme ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';
  const formSecurityTextColor = isLightTheme ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)';

  return (
    <div
      className="relative w-full overflow-x-hidden flex flex-col"
      style={{
        background: d.isGradientBg ? d.bgStart : d.bgStart,
        minHeight: fullHeight ? '100vh' : 'auto',
      }}
    >
      <div
        className={`relative z-10 w-full flex flex-1 ${isMobile ? 'flex-col' : 'flex-row'}`}
      >
        {/* Left: Content centered (no image) */}
        <div
          className={`flex flex-col items-center justify-center text-center ${isMobile ? 'w-full px-5 py-8' : 'w-1/2 px-10 py-16'}`}
        >
          {data.subheadline && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                backgroundColor: `${d.accentColor}20`,
                color: d.labelColor,
                border: `1px solid ${d.accentColor}40`,
              }}
            >
              {data.subheadline}
            </span>
          )}
          <h1
            className="font-extrabold leading-tight mb-4"
            style={{
              color: d.headlineColor,
              fontSize: isMobile ? `${d.headlineSizeMobile}rem` : `${d.headlineSizeDesktop}rem`,
              lineHeight: 1.15,
            }}
          >
            {data.headline || "Sua Headline Impactante Vai Aqui"}
          </h1>
          <p
            className="leading-relaxed text-sm md:text-base lg:text-lg mb-6 max-w-md"
            style={{ color: d.descriptionColor }}
          >
            {data.description || "Descrição persuasiva sobre o que a pessoa vai ganhar ao se cadastrar agora."}
          </p>
        </div>

        {/* Right: Glassmorphism Form */}
        <div
          className={`flex items-center justify-center ${isMobile ? 'w-full px-5 py-8' : 'w-1/2 px-10 py-16'}`}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 md:p-8"
            style={formCardStyle}
          >
            {isSuccess ? (
              <CaptureSuccessScreen
                accentColor={d.accentColor}
                textColor={formTextColor}
                isDownloading={isDownloading}
                onDownload={handleDownload}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2
                  className="text-xl font-bold text-center mb-2"
                  style={{ color: formHeadingColor }}
                >
                  Preencha para acessar
                </h2>
                <CaptureFormInputs
                  formFields={d.formFields}
                  formData={formData}
                  onInputChange={handleInputChange}
                  textColor={formTextColor}
                  placeholderColor={d.placeholderColor}
                  inputBgColor={formInputBg}
                  inputBorderColor={formInputBorder}
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
                <p className="text-center text-xs" style={{ color: formSecurityTextColor }}>
                  🔒 Seus dados estão 100% seguros
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <LegalFooter textColor={d.textColor} showWatermark={true} ownerPlan={ownerPlan} />
    </div>
  );
};

export default LayoutSplitDark;
