import { LandingPageFormData } from "@/types/landing-page";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, ImageIcon } from "lucide-react";
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

  // Light backgrounds for this layout
  const bgColor = d.isGradientBg ? d.bgStart : '#f8fafc';
  const cardTextColor = '#1f2937';

  return (
    <div
      className="relative w-full overflow-x-hidden"
      style={{
        background: d.isGradientBg ? d.bgStart : `linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)`,
        minHeight: fullHeight ? '100vh' : 'auto',
      }}
    >
      <div
        className="relative z-10 w-full flex flex-col items-center justify-center px-4 py-12 md:py-20"
        style={{ minHeight: fullHeight ? '100vh' : 'auto' }}
      >
        {/* Small icon/image at top */}
        {data.image_url ? (
          <div className="mb-6">
            <img
              src={data.image_url}
              alt="Hero"
              className="w-20 h-20 md:w-28 md:h-28 object-contain rounded-xl"
              style={{ filter: `drop-shadow(0 4px 20px ${d.accentColor}30)` }}
            />
          </div>
        ) : (
          <div
            className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${d.accentColor}15` }}
          >
            <ImageIcon className="w-8 h-8" style={{ color: d.accentColor }} />
          </div>
        )}

        {/* Badge */}
        {data.subheadline && (
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{
              backgroundColor: `${d.accentColor}12`,
              color: d.accentColor,
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
            color: d.isGradientBg ? d.headlineColor : '#111827',
            fontSize: isMobile ? `${d.headlineSizeMobile}rem` : `${d.headlineSizeDesktop}rem`,
            lineHeight: 1.15,
          }}
        >
          {data.headline || "Sua Headline Impactante Vai Aqui"}
        </h1>

        {data.description && (
          <p
            className="text-center max-w-lg mb-8 text-sm md:text-base"
            style={{ color: d.isGradientBg ? d.descriptionColor : '#6b7280' }}
          >
            {data.description}
          </p>
        )}

        {/* White card with form */}
        <div
          className="w-full max-w-xl rounded-2xl p-6 md:p-8"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.06)',
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
                placeholderColor="#9ca3af"
                inputBgColor="#f9fafb"
                inputBorderColor="#e5e7eb"
                variant={isMobile ? 'default' : 'horizontal'}
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
              <p className="text-center text-xs text-gray-400">
                🔒 Seus dados estão 100% seguros
              </p>
            </form>
          )}
        </div>
      </div>

      <LegalFooter textColor={d.isGradientBg ? d.textColor : '#6b7280'} showWatermark={true} ownerPlan={ownerPlan} />
    </div>
  );
};

export default LayoutMinimalistCenter;
