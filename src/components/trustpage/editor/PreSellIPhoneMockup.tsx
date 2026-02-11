import { PresellContent } from "@/types/landing-page";
import PreSellTemplate from "../templates/PreSellTemplate";
import ScaledViewport from "./ScaledViewport";

interface PreSellIPhoneMockupProps {
  content: PresellContent;
  ownerPlan?: string | null;
  size?: "normal" | "large";
}

const PreSellIPhoneMockup = ({ content, ownerPlan, size = "normal" }: PreSellIPhoneMockupProps) => {
  const dimensions =
    size === "large"
      ? {
          width: "w-[340px]",
          height: "h-[690px]",
          radius: "rounded-[50px]",
          innerRadius: "rounded-[42px]",
          contentWidth: 320,
          viewportWidth: 393,
        }
      : {
          width: "w-[280px]",
          height: "h-[570px]",
          radius: "rounded-[44px]",
          innerRadius: "rounded-[38px]",
          contentWidth: 260,
          viewportWidth: 393,
        };

  const scale = dimensions.contentWidth / dimensions.viewportWidth;

  const backgroundColor = content.backgroundType === "gradient" ? content.gradientStart : content.backgroundColor;
  const textColor = content.textColor;

  return (
    <div className="relative shrink-0">
      {/* iPhone Frame */}
      <div
        className={`${dimensions.width} ${dimensions.height} bg-gradient-to-b from-zinc-700 to-zinc-900 ${dimensions.radius} p-[10px] shadow-2xl`}
        style={{
          boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset",
        }}
      >
        {/* ... (Botões e Dynamic Island mantidos iguais) ... */}
        <div className="absolute left-[-2px] top-[80px] w-[3px] h-[25px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute left-[-2px] top-[115px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute left-[-2px] top-[165px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute right-[-2px] top-[130px] w-[3px] h-[60px] bg-zinc-600 rounded-r-sm" />

        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-[6px] h-[6px] bg-zinc-800 rounded-full mr-[25px]" />
        </div>

        {/* Screen */}
        <div
          className={`w-full h-full ${dimensions.innerRadius} overflow-hidden relative`}
          style={{
            boxShadow: "0 0 0 1px rgba(0,0,0,0.2) inset",
            backgroundColor,
          }}
        >
          {/* Status Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-8 flex items-end justify-between px-5 pb-1 text-[9px] font-semibold z-10"
            style={{ color: textColor }}
          >
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-[2px]">
                <div className="w-[2px] h-[6px] rounded-sm" style={{ backgroundColor: textColor }} />
                <div className="w-[2px] h-[8px] rounded-sm" style={{ backgroundColor: textColor }} />
                <div className="w-[2px] h-[10px] rounded-sm" style={{ backgroundColor: textColor }} />
                <div className="w-[2px] h-[12px] rounded-sm" style={{ backgroundColor: `${textColor}40` }} />
              </div>
              <svg className="w-4 h-2 ml-1" viewBox="0 0 24 12" fill={textColor}>
                <rect x="0" y="0" width="21" height="12" rx="3" stroke={textColor} strokeWidth="1" fill="none" />
                <rect x="2" y="2" width="17" height="8" rx="1" fill={textColor} />
                <rect x="22" y="3" width="2" height="6" rx="1" fill={textColor} />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div
            className="absolute top-8 left-0 right-0 bottom-0 overflow-y-auto iphone-presell-scroll"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              backgroundColor,
              overflowX: "hidden",
            }}
          >
            <style>{`.iphone-presell-scroll::-webkit-scrollbar { display: none; }`}</style>
            <ScaledViewport viewportWidth={dimensions.viewportWidth} scale={scale}>
              {/* CORREÇÃO AQUI: Adicionado 'min-h-[844px]' 
                  Isso simula a altura real de um iPhone 12/13/14. 
                  Impede que o conteúdo seja comprimido quando o navegador diminui.
              */}
              <div
                className="w-full relative flex flex-col min-h-[844px]"
                style={{
                  backgroundColor,
                  alignItems: "stretch",
                }}
              >
                <PreSellTemplate content={content} isMobile={true} isPreview={true} ownerPlan={ownerPlan} />
              </div>
            </ScaledViewport>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div
        className={`absolute inset-0 ${dimensions.radius} pointer-events-none`}
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%)",
        }}
      />
    </div>
  );
};

export default PreSellIPhoneMockup;
