import { AdvertorialContent } from "@/types/advertorial";
import AdvertorialTemplate from "../templates/advertorial/AdvertorialTemplate";
import ScaledViewport from "./ScaledViewport";
import { PUBLIC_PAGES_DOMAIN } from "@/lib/constants";

interface Props {
  content: AdvertorialContent;
  ownerPlan?: string | null;
}

const AdvertorialIMacMockup = ({ content, ownerPlan }: Props) => {
  const screenWidth = 512;
  const viewportWidth = 1280;
  const scale = screenWidth / viewportWidth;

  return (
    <div className="relative shrink-0">
      <div className="w-[520px] h-[340px] bg-gradient-to-b from-zinc-200 to-zinc-300 rounded-xl p-1 shadow-2xl" style={{ boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)" }}>
        <div className="w-full h-full bg-black rounded-lg p-[2px]">
          <div className="w-full h-full bg-white rounded-md overflow-hidden relative">
            {/* Browser chrome */}
            <div className="h-6 bg-zinc-800 flex items-center px-2 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="flex-1 mx-4">
                <div className="bg-zinc-700 rounded-md h-4 flex items-center justify-center">
                  <span className="text-[8px] text-zinc-400">{PUBLIC_PAGES_DOMAIN}/p/seu-advertorial</span>
                </div>
              </div>
            </div>

            <div className="h-[calc(100%-24px)] w-full overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
              <ScaledViewport viewportWidth={viewportWidth} scale={scale}>
                <AdvertorialTemplate content={content} isPreview ownerPlan={ownerPlan} />
              </ScaledViewport>
            </div>
          </div>
        </div>
      </div>
      {/* Stand */}
      <div className="w-[160px] h-[40px] bg-gradient-to-b from-zinc-300 to-zinc-400 mx-auto rounded-b-lg" style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)" }} />
      <div className="w-[200px] h-[8px] bg-zinc-400 mx-auto rounded-b-md" />
    </div>
  );
};

export default AdvertorialIMacMockup;
