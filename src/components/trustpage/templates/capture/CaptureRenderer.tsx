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

  // 🔥 O SEGREDO ESTÁ AQUI: Detecção de Mockup
  // Se não recebemos um pageId, significa que estamos dentro do editor do Lovable (Mockup).
  // Nesse caso, forçamos o fullHeight para FALSE para impedir que a página crie o "buraco infinito" do tamanho do seu monitor.
  const isMockup = !pageId;
  const safeFullHeight = isMockup ? false : fullHeight;

  const content = (() => {
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
  })();

  // 🔥 CORREÇÃO 2: Removidos os wrappers "min-h-full" e "flex-1" que forçavam o estiramento.
  // Agora a página acaba exatamente onde o rodapé acaba!
  return <div className="w-full relative">{content}</div>;
};

export default CaptureRenderer;
