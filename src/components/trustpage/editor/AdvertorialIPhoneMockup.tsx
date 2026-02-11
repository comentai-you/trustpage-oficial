import { AdvertorialContent } from "@/types/advertorial";
import AdvertorialTemplate from "../templates/advertorial/AdvertorialTemplate";
import ScaledViewport from "./ScaledViewport";

interface Props {
  content: AdvertorialContent;
  ownerPlan?: string | null;
  size?: "normal" | "large";
}

const AdvertorialIPhoneMockup = ({ content, ownerPlan, size = "normal" }: Props) => {
  const dimensions =
    size === "large"
      ? { width: "w-[340px]", height: "h-[690px]", radius: "rounded-[50px]", innerRadius: "rounded-[42px]", contentWidth: 320, viewportWidth: 393 }
      : { width: "w-[280px]", height: "h-[570px]", radius: "rounded-[44px]", innerRadius: "rounded-[38px]", contentWidth: 260, viewportWidth: 393 };

  const scale = dimensions.contentWidth / dimensions.viewportWidth;

  return (
    <div className={`${dimensions.width} ${dimensions.height} bg-gradient-to-b from-zinc-800 to-zinc-900 ${dimensions.radius} p-2 shadow-2xl relative shrink-0`}>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-zinc-900 rounded-b-2xl z-10" />
      
      {/* Screen */}
      <div className={`w-full h-full bg-white ${dimensions.innerRadius} overflow-hidden relative`}>
        {/* Status bar */}
        <div className="h-11 bg-white flex items-end justify-between px-6 pb-1 text-[10px] font-semibold text-black z-10 relative">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 border border-black rounded-sm relative">
              <div className="absolute inset-[1px] bg-black rounded-[1px]" style={{ width: "70%" }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-44px-20px)] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
          <ScaledViewport viewportWidth={dimensions.viewportWidth} scale={scale}>
            <AdvertorialTemplate content={content} isMobile isPreview ownerPlan={ownerPlan} />
          </ScaledViewport>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-black/20 rounded-full" />
      </div>
    </div>
  );
};

export default AdvertorialIPhoneMockup;
