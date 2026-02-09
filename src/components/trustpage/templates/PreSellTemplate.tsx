import { PresellContent } from "@/types/landing-page";
import PreSellCookieWallTemplate from "./presell/PreSellCookieWallTemplate";

interface PreSellTemplateProps {
  content: PresellContent;
  /** Força modo mobile/desktop apenas em preview (mockups). */
  isMobile?: boolean;
  isPreview?: boolean;
  ownerPlan?: string | null;
}

const PreSellTemplate = ({ content, isMobile, isPreview = false, ownerPlan }: PreSellTemplateProps) => {
  // Cookie Wall é o único layout deste template.
  return (
    <PreSellCookieWallTemplate
      content={{ ...content, layoutType: "cookie-wall" }}
      isMobile={isMobile}
      isPreview={isPreview}
      ownerPlan={ownerPlan}
    />
  );
};

export default PreSellTemplate;

