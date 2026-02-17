import { LandingPageFormData } from "@/types/landing-page";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, User } from "lucide-react";
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

const LayoutMinimalistCenter = ({ data, isMobile, fullHeight, pageId, ownerPlan }: Props) => {
  const d = extractCaptureData(data);
  const { formData, isSubmitting, isSuccess, isDownloading, handleInputChange, handleSubmit, handleDownload } =
    useCaptureForm({ pageId, ctaUrl: data.cta_url, formFields: d.formFields, magnetConfig: d.magnetConfig });

  const isLightTheme =
    !d.isGradientBg &&
    (d.bgStart === "#ffffff" ||
      d.bgStart === "#f8fafc" ||
      d.bgStart === "#fffbeb" ||
      d.bgStart === "#ecfdf5" ||
      d.bgStart === "#fdf2f8" ||
      d.bgStart === "#f0f9ff" ||
      d.bgStart.startsWith("#f") ||
      d.bgStart.startsWith("#e"));
  const bgColor = d.isGradientBg ? d.bgStart : isLightTheme ? d.bgStart : "#f8fafc";
  const bgGradient = d.isGradientBg
    ? d.bgStart
    : isLightTheme
      ? `linear-gradient(180deg, ${d.bgStart} 0%, ${d.bgEnd} 100%)`
      : `linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)`;
  const hasCustomHeadline = !!(data.content as any)?.textColors?.headline;
  const hasCustomDesc = !!(data.content as any)?.textColors?.description;
  const headlineColor = hasCustomHeadline
    ? d.headlineColor
    : isLightTheme || d.isGradientBg
      ? d.headlineColor
      : "#111827";
  const descColor = hasCustomDesc
    ? d.descriptionColor
    : isLightTheme || d.isGradientBg
      ? d.descriptionColor
      : "#6b7280";
  const cardTextColor = isLightTheme ? d.textColor : "#1f2937";

  return (
    <div
      // 🔥 MUDANÇA 1: "flex flex-col min-h-full" na raiz para que o gradiente envolva tudo (conteúdo + rodapé)
      className="relative w-full overflow-x-hidden flex flex-col min-h-full"
      style={{
        background: bgGradient,
        minHeight: fullHeight ? "100vh" : "100%",
      }}
    >
      <div
        // 🔥 MUDANÇA 2: Adicionado flex-1 aqui. Substituímos o "minHeight: 100vh" que forçava um buraco por "flex-1",
        // que estica naturalmente e empurra o rodapé pro fundo da página, sem quebrar o fundo.
        className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20"
      >
        {/* Profile photo (round, like bio link) */}
        {data.profile_image_url ? (
          <div className="mb-6">
            <img
              src={data.profile_image_url}
              alt="Perfil"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4"
              style={{
                borderColor: `${d.accentColor}40`,
                boxShadow: `0 4px 20px ${d.accentColor}20`,
              }}
            />
          </div>
        ) : (
          <div
            className="mb-6 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${d.accentColor}15`, border: `2px dashed ${d.accentColor}40` }}
          >
            <User className="w-8 h-8" style={{ color: d.accentColor }} />
          </div>
        )}

        {/* Badge */}
        {data.subheadline && (
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{
              backgroundColor: `${d.accentColor}12`,
              color: d.labelColor,
              border: `1px solid ${d.accentColor}30`,
            }}
          >
            {data.subheadline}
          </span>
        )}

        {/* Headline centered */}
        <h1
          className="font-extrabold leading-tight text-center max-w-2xl mb-3"
          style={{
            color: headlineColor,
            fontSize: isMobile ? `${d.headlineSizeMobile}rem` : `${d.headlineSizeDesktop}rem`,
            lineHeight: 1.15,
          }}
        >
          {data.headline || "Sua Headline Impactante Vai Aqui"}
        </h1>

        {data.description && (
          <p className="text-center max-w-lg mb-8 text-sm md:text-base" style={{ color: descColor }}>
            {data.description}
          </p>
        )}

        {/* White card with form */}
        <div
          className="w-full max-w-xl rounded-2xl p-6 md:p-8"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {isSuccess ? (
            <CaptureSuccessScreen
              accentColor={d.accentColor}
              textColor={cardTextColor}
              isDownloading={isDownloading}
              onDownload={handleDownload}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <CaptureFormInputs
                formFields={d.formFields}
                formData={formData}
                onInputChange={handleInputChange}
                textColor={cardTextColor}
                placeholderColor={isLightTheme || !d.isGradientBg ? d.placeholderColor : "#9ca3af"}
                inputBgColor="#f9fafb"
                inputBorderColor="#e5e7eb"
                variant={isMobile ? "default" : "horizontal"}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-base font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${d.accentColor} 0%, ${d.accentColor}cc 100%)`,
                  color: d.buttonTextColor,
                  boxShadow: `0 8px 20px -8px ${d.accentColor}60`,
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
              <p className="text-center text-xs text-gray-400">🔒 Seus dados estão 100% seguros</p>
            </form>
          )}
        </div>
      </div>

      <LegalFooter textColor={d.isGradientBg ? d.textColor : "#6b7280"} showWatermark={true} ownerPlan={ownerPlan} />
    </div>
  );
};

export default LayoutMinimalistCenter;
