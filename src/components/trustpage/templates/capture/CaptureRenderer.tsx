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
  const layoutId: CaptureLayoutId = data.capture_layout_id || "classic";

  // 🔥 O SEGREDO ESTÁ AQUI:
  // Se não temos um 'pageId', significa que a página está sendo vista no Editor (Mockup).
  // Ao forçar o fullHeight como 'false' aqui, nós impedimos os layouts de usarem '100vh' (Altura do seu monitor real),
  // o que corta instantaneamente o espaço gigante fantasma abaixo do rodapé!
  const safeFullHeight = pageId ? fullHeight : false;

  switch (layoutId) {
    case "split-dark":
      return (
        <LayoutSplitDark
          data={data}
          isMobile={isMobile}
          fullHeight={safeFullHeight}
          pageId={pageId}
          ownerPlan={ownerPlan}
        />
      );
    case "minimalist-center":
      return (
        <LayoutMinimalistCenter
          data={data}
          isMobile={isMobile}
          fullHeight={safeFullHeight}
          pageId={pageId}
          ownerPlan={ownerPlan}
        />
      );
    case "background-hero":
      return (
        <LayoutBackgroundHero
          data={data}
          isMobile={isMobile}
          fullHeight={safeFullHeight}
          pageId={pageId}
          ownerPlan={ownerPlan}
        />
      );
    case "classic":
    default:
      return (
        <HeroCaptureTemplate
          data={data}
          isMobile={isMobile}
          fullHeight={safeFullHeight}
          pageId={pageId}
          ownerPlan={ownerPlan}
        />
      );
  }
};

export default CaptureRenderer;
