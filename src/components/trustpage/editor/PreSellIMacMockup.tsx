import { PresellContent } from "@/types/landing-page";
import PreSellTemplate from "../templates/PreSellTemplate";
import ScaledViewport from "./ScaledViewport";
import { PUBLIC_PAGES_DOMAIN } from "@/lib/constants";

interface PreSellIMacMockupProps {
  content: PresellContent;
  ownerPlan?: string | null;
}

const PreSellIMacMockup = ({ content, ownerPlan }: PreSellIMacMockupProps) => {
  const screenWidth = 512;
  const viewportWidth = 1280;
  const scale = screenWidth / viewportWidth;

  const backgroundColor = content.backgroundType === "gradient" ? content.gradientStart : content.backgroundColor;

  return (
    <div className="relative shrink-0">
      {/* iMac Frame */}
      <div
        className="w-[520px] h-[340px] bg-gradient-to-b from-zinc-200 to-zinc-300 rounded-xl p-1 shadow-2xl"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)",
        }}
      >
        {/* Screen bezel */}
        <div className="w-full h-full bg-black rounded-lg p-[2px]">
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-md overflow-hidden relative" style={{ backgroundColor }}>
            {/* Browser chrome */}
            <div className="h-6 bg-zinc-800 flex items-center px-2 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="flex-1 mx-4">
                <div className="bg-zinc-700 rounded-md h-4 flex items-center justify-center">
                  <span className="text-[8px] text-zinc-400">{PUBLIC_PAGES_DOMAIN}/p/sua-presell</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              className="h-[calc(100%-24px)] w-full overflow-y-auto overflow-x-hidden imac-presell-scroll"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                backgroundColor,
              }}
            >
              <style>{`.imac-presell-scroll::-webkit-scrollbar { display: none; }`}</style>
              <ScaledViewport viewportWidth={viewportWidth} scale={scale}>
                {/* CORREÇÃO AQUI: Adicionado 'min-h-[800px]'
                   Isso força o conteúdo a renderizar como se estivesse em um monitor de pelo menos 800px de altura,
                   mesmo que a janela do navegador seja pequena.
                */}
                <div className="w-full relative min-h-[800px]" style={{ backgroundColor }}>
                  <PreSellTemplate content={content} isMobile={false} isPreview={true} ownerPlan={ownerPlan} />
                </div>
              </ScaledViewport>
            </div>
          </div>
        </div>
      </div>

      {/* iMac Stand */}
      <div className="flex flex-col items-center">
        <div className="w-[520px] h-5 bg-gradient-to-b from-zinc-300 to-zinc-400 rounded-b-xl flex items-center justify-center">
          <div className="w-10 h-1.5 bg-zinc-500/50 rounded-full" />
        </div>
        <div className="w-20 h-12 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-b" />
        <div
          className="w-32 h-2 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-b-xl"
          style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
        />
      </div>
    </div>
  );
};

export default PreSellIMacMockup;
