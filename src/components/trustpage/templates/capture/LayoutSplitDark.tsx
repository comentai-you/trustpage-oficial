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

  return (
    <div
      className="relative w-full overflow-x-hidden"
      style={{
        background: d.isGradientBg ? d.bgStart : d.bgStart,
        minHeight: fullHeight ? '100vh' : 'auto',
      }}
    >
      <div
        className={`relative z-10 w-full flex ${isMobile ? 'flex-col' : 'flex-row'}`}
        style={{ minHeight: fullHeight ? '100vh' : 'auto' }}
      >
        {/* Left: Content centered (no image) */}
        <div
          className={`flex flex-col items-center justify-center text-center ${isMobile ? 'w-full px-5 py-8' : 'w-1/2 px-10 py-16'}`}
          style={{ background: d.isGradientBg ? d.bgStart : d.bgStart }}
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
          style={{
            background: `linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.9) 100%)`,
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 md:p-8"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid rgba(255,255,255,0.1)`,
              boxShadow: `0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            {isSuccess ? (
              <CaptureSuccessScreen
                accentColor={d.accentColor}
                textColor="#ffffff"
                isDownloading={isDownloading}
                onDownload={handleDownload}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2
                  className="text-xl font-bold text-center mb-2"
                  style={{ color: '#ffffff' }}
                >
                  Preencha para acessar
                </h2>
                <CaptureFormInputs
                  formFields={d.formFields}
                  formData={formData}
                  onInputChange={handleInputChange}
                  textColor="#ffffff"
                  placeholderColor="rgba(255,255,255,0.5)"
                  inputBgColor="rgba(255,255,255,0.08)"
                  inputBorderColor="rgba(255,255,255,0.15)"
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
                <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
