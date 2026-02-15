import { LandingPageFormData, CaptureLayoutId } from "@/types/landing-page";
import HeroCaptureTemplate from "../HeroCaptureTemplate";
import LayoutSplitDark from "./LayoutSplitDark";
import LayoutMinimalistCenter from "./LayoutMinimalistCenter";
import LayoutBackgroundHero from "./LayoutBackgroundHero";

interface CaptureRendererProps {
  data: LandingPageFormData;
  isMobile?: boolean;
  fullHeight?: boolean;
  pageId?: string;
  ownerPlan?: string | null;
}

const CaptureRenderer = ({ data, isMobile, fullHeight, pageId, ownerPlan }: CaptureRendererProps) => {
  const layoutId: CaptureLayoutId = data.capture_layout_id || 'classic';

  switch (layoutId) {
    case 'split-dark':
      return (
        <LayoutSplitDark
          data={data}
          isMobile={isMobile}
          fullHeight={fullHeight}
          pageId={pageId}
          ownerPlan={ownerPlan}
        />
      );
    case 'minimalist-center':
      return (
        <LayoutMinimalistCenter
          data={data}
          isMobile={isMobile}
          fullHeight={fullHeight}
          pageId={pageId}
          ownerPlan={ownerPlan}
        />
      );
    case 'background-hero':
      return (
        <LayoutBackgroundHero
          data={data}
          isMobile={isMobile}
          fullHeight={fullHeight}
          pageId={pageId}
          ownerPlan={ownerPlan}
        />
      );
    case 'classic':
    default:
      return (
        <HeroCaptureTemplate
          data={data}
          isMobile={isMobile}
          fullHeight={fullHeight}
          pageId={pageId}
          ownerPlan={ownerPlan}
        />
      );
  }
};

export default CaptureRenderer;
