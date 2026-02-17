import { LandingPageFormData } from "@/types/landing-page";
import CaptureRenderer from "../templates/capture/CaptureRenderer";
import ScaledViewport from "./ScaledViewport";

interface CaptureIPhoneMockupProps {
  formData: LandingPageFormData;
  size?: "normal" | "large";
}

const CaptureIPhoneMockup = ({ formData, size = "normal" }: CaptureIPhoneMockupProps) => {
  const dimensions =
    size === "large"
      ? {
          width: "w-[340px]",
          height: "h-[690px]",
          radius: "rounded-[50px]",
          innerRadius: "rounded-[42px]",
          contentWidth: 320,
          contentHeight: 650,
          viewportWidth: 393,
        }
      : {
          width: "w-[280px]",
          height: "h-[570px]",
          radius: "rounded-[44px]",
          innerRadius: "rounded-[38px]",
          contentWidth: 260,
          contentHeight: 530,
          viewportWidth: 393,
        };

  const scale = dimensions.contentWidth / dimensions.viewportWidth;

  const bg = formData.colors?.background || "#ffffff";
  const statusBarColor = formData.colors?.text || "#ffffff";

  return (
    <div className="relative">
      {/* iPhone Frame */}
      <div
        className={`${dimensions.width} ${dimensions.height} bg-gradient-to-b from-zinc-700 to-zinc-900 ${dimensions.radius} p-[10px] shadow-2xl relative`}
        style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset" }}
      >
        {/* Side buttons */}
        <div className="absolute left-[-2px] top-[80px] w-[3px] h-[25px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute left-[-2px] top-[115px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute left-[-2px] top-[165px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute right-[-2px] top-[130px] w-[3px] h-[60px] bg-zinc-600 rounded-r-sm" />

        {/* Dynamic Island */}
        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-[6px] h-[6px] bg-zinc-800 rounded-full mr-[25px]" />
        </div>

        {/* Screen */}
        <div
          className={`w-full h-full ${dimensions.innerRadius} overflow-hidden relative`}
          style={{ backgroundColor: bg }}
        >
          {/* Status Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-8 flex items-end justify-between px-5 pb-1 text-[9px] font-semibold z-10"
            style={{ color: statusBarColor }}
          >
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-[2px]">
                <div className="w-[2px] h-[6px] rounded-sm" style={{ backgroundColor: statusBarColor }} />
                <div className="w-[2px] h-[8px] rounded-sm" style={{ backgroundColor: statusBarColor }} />
                <div className="w-[2px] h-[10px] rounded-sm" style={{ backgroundColor: statusBarColor }} />
                <div className="w-[2px] h-[12px] rounded-sm" style={{ backgroundColor: `${statusBarColor}40` }} />
              </div>
              <svg className="w-4 h-2 ml-1" viewBox="0 0 24 12" fill={statusBarColor}>
                <rect x="0" y="0" width="21" height="12" rx="3" stroke={statusBarColor} strokeWidth="1" fill="none" />
                <rect x="2" y="2" width="17" height="8" rx="1" fill={statusBarColor} />
                <rect x="22" y="3" width="2" height="6" rx="1" fill={statusBarColor} />
              </svg>
            </div>
          </div>

          {/* Scrollable content */}
          <div
            className="absolute top-8 left-0 right-0 bottom-0 overflow-y-auto overflow-x-hidden capture-iphone-scroll"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              backgroundColor: bg,
            }}
          >
            <style>{`.capture-iphone-scroll::-webkit-scrollbar { display: none; }`}</style>
            <ScaledViewport viewportWidth={dimensions.viewportWidth} scale={scale}>
              {/* CORREÇÃO AQUI: Forçando a altura base e permitindo expansão segura */}
              <div className="w-full" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <CaptureRenderer data={formData} isMobile={true} fullHeight={false} />
              </div>
            </ScaledViewport>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div
        className={`absolute inset-0 ${dimensions.radius} pointer-events-none`}
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%)" }}
      />
    </div>
  );
};

export default CaptureIPhoneMockup;
