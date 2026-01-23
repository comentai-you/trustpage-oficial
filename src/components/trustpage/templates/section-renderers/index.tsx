import { ContentSection, SectionBuilderContent } from "@/types/section-builder";
import HeroRenderer from "./HeroRenderer";
import HeadlineRenderer from "./HeadlineRenderer";
import TextRenderer from "./TextRenderer";
import FullImageRenderer from "./FullImageRenderer";
import DualColumnRenderer from "./DualColumnRenderer";
import BenefitsRenderer from "./BenefitsRenderer";
import FAQRenderer from "./FAQRenderer";
import TestimonialsRenderer from "./TestimonialsRenderer";
import CTARenderer from "./CTARenderer";
import SpacerRenderer from "./SpacerRenderer";
import VideoGridRenderer from "./VideoGridRenderer";
import OfferRenderer from "./OfferRenderer";

interface SectionRendererProps {
  section: ContentSection;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
  ctaUrl?: string;
}

export const SectionRenderer = ({ 
  section, 
  primaryColor, 
  textColor, 
  backgroundColor,
  isDarkTheme,
  isMobile = false,
  ctaUrl
}: SectionRendererProps) => {
  switch (section.type) {
    case 'hero':
      return (
        <HeroRenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
          isDarkTheme={isDarkTheme}
          isMobile={isMobile}
          ctaUrl={ctaUrl}
        />
      );
    case 'headline':
      return (
        <HeadlineRenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
          isMobile={isMobile}
        />
      );
    case 'text':
      return (
        <TextRenderer
          data={section.data}
          textColor={textColor}
        />
      );
    case 'full-image':
      return (
        <FullImageRenderer
          data={section.data}
          primaryColor={primaryColor}
          isDarkTheme={isDarkTheme}
        />
      );
    case 'dual-column':
      return (
        <DualColumnRenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
          isMobile={isMobile}
        />
      );
    case 'benefits':
      return (
        <BenefitsRenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
          isMobile={isMobile}
        />
      );
    case 'faq':
      return (
        <FAQRenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
        />
      );
    case 'testimonials':
      return (
        <TestimonialsRenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
          isMobile={isMobile}
        />
      );
    case 'cta':
      return (
        <CTARenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
        />
      );
    case 'video-grid':
      return (
        <VideoGridRenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
          isMobile={isMobile}
        />
      );
    case 'offer':
      return (
        <OfferRenderer
          data={section.data}
          primaryColor={primaryColor}
          textColor={textColor}
          isDarkTheme={isDarkTheme}
        />
      );
    case 'spacer':
      return (
        <SpacerRenderer data={section.data} />
      );
    default:
      return null;
  }
};

interface DynamicSectionsRendererProps {
  content: SectionBuilderContent;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  isDarkTheme: boolean;
  isMobile?: boolean;
  ctaUrl?: string;
}

export const DynamicSectionsRenderer = ({
  content,
  primaryColor,
  textColor,
  backgroundColor,
  isDarkTheme,
  isMobile = false,
  ctaUrl
}: DynamicSectionsRendererProps) => {
  const sections = content.sections || [];
  
  // Sort by order
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <>
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          primaryColor={primaryColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
          isDarkTheme={isDarkTheme}
          isMobile={isMobile}
          ctaUrl={ctaUrl}
        />
      ))}
    </>
  );
};

export default DynamicSectionsRenderer;
