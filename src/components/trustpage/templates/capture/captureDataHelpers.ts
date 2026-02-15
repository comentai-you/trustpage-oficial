import { LandingPageFormData, CaptureLayoutId } from "@/types/landing-page";
import { CaptureFormFields, MagnetConfig } from "./useCaptureForm";

export const extractCaptureData = (data: LandingPageFormData) => {
  const bgStart = data.colors.background || "#0f172a";
  const bgEnd = data.colors.primary || "#1e293b";
  const accentColor = data.primary_color || "#3b82f6";
  const textColor = data.colors.text || "#ffffff";

  const textColors = (data.content as any)?.textColors || {};
  const labelColor = textColors.label || accentColor;
  const headlineColor = textColors.headline || textColor;
  const descriptionColor = textColors.description || `${textColor}cc`;
  const placeholderColor = textColors.placeholder || `${textColor}80`;
  const buttonTextColor = textColors.button || '#ffffff';

  const isGradientBg = bgStart.includes('linear-gradient') || bgStart.includes('radial-gradient');

  const headlineSizeMobile = data.headline_size_mobile || 1.5;
  const headlineSizeDesktop = data.headline_size_desktop || 2.5;

  const heroImageSizeMobile = data.hero_image_size_mobile || 100;
  const heroImageSizeDesktop = data.hero_image_size_desktop || 100;

  const formFields: CaptureFormFields = (data.content as any)?.formFields || {
    showName: true,
    showEmail: true,
    showPhone: false,
    showWhatsapp: false,
  };

  const magnetConfig: MagnetConfig = (data.content as any)?.magnetConfig || {
    type: 'link',
    link: '',
    fileUrl: '',
  };

  const layoutId: CaptureLayoutId = data.capture_layout_id || 'classic';

  return {
    bgStart,
    bgEnd,
    accentColor,
    textColor,
    labelColor,
    headlineColor,
    descriptionColor,
    placeholderColor,
    buttonTextColor,
    isGradientBg,
    headlineSizeMobile,
    headlineSizeDesktop,
    heroImageSizeMobile,
    heroImageSizeDesktop,
    formFields,
    magnetConfig,
    layoutId,
  };
};
