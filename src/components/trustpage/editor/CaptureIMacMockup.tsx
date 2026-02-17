import { LandingPageFormData } from "@/types/landing-page";
import CaptureRenderer from "../templates/capture/CaptureRenderer";
import ScaledViewport from "./ScaledViewport";
import { PUBLIC_PAGES_DOMAIN } from "@/lib/constants";
import { extractCaptureData } from "../templates/capture/captureDataHelpers";

interface CaptureIMacMockupProps {
  formData: LandingPageFormData;
}

const CaptureIMacMockup = ({ formData }: CaptureIMacMockupProps) => {
  const screenWidth = 512;
  const viewportWidth = 1280;
  const scale = screenWidth / viewportWidth;

  const d = extractCaptureData(formData);
  // Usamos a cor inicial apenas para evitar flash preto, mas o layout vai cobrir 100%
  const fallbackBg = d.bgStart.includes("linear") ? "#111827" : d.bgStart;

  // Altura exata da tela útil do iMac
  const virtualHeight = 312 / scale;

  return (
    <div className="relative shrink-0">
      {/* iMac Frame */}
      <div
        className="w-[520px] h-[340px] bg-gradient-to-b from-zinc-200 to-zinc-300 rounded-xl p-1 shadow-2xl"
        style={{ boxShadow: "0 25px 60px -15px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)" }}
      >
        <div className="w-full h-full bg-black rounded-lg p-[2px]">
          <div className="w-full h-full rounded-md overflow-hidden relative" style={{ backgroundColor: fallbackBg }}>
            {/* Browser chrome */}
            <div className="h-6 bg-zinc-800 flex items-center px-2 gap-1.5 z-10 relative">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="flex-1 mx-4">
                <div className="bg-zinc-700 rounded-md h-4 flex items-center justify-center">
                  <span className="text-[8px] text-zinc-400">{PUBLIC_PAGES_DOMAIN}/p/sua-pagina</span>
                </div>
              </div>
            </div>

            {/* Scroll Area */}
            <div
              className="h-[calc(100%-24px)] w-full overflow-y-auto overflow-x-hidden capture-imac-scroll relative"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.capture-imac-scroll::-webkit-scrollbar { display: none; }`}</style>
              <ScaledViewport viewportWidth={viewportWidth} scale={scale}>
                {/* 🔥 O ESTICADOR MÁGICO: Força o layout e o gradiente a preencherem o vazio */}
                <div
                  className="mockup-stretcher"
                  style={{ display: "grid", minHeight: `${virtualHeight}px`, width: "100%" }}
                >
                  <style>{`
                    .mockup-stretcher > * { min-height: 100% !important; height: 100%; }
                    .mockup-stretcher > * > * { min-height: 100% !important; }
                  `}</style>

                  <CaptureRenderer data={formData} isMobile={false} fullHeight={false} />
                </div>
              </ScaledViewport>
            </div>
          </div>
        </div>
      </div>

      {/* Stand */}
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

export default CaptureIMacMockup;
