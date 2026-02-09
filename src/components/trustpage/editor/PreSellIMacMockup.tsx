import { PresellContent } from "@/types/landing-page";
import PreSellTemplate from "../templates/PreSellTemplate";
import ScaledViewport from "./ScaledViewport";
import { PUBLIC_PAGES_DOMAIN } from "@/lib/constants";

interface PreSellIMacMockupProps {
  content: PresellContent;
  ownerPlan?: string | null;
}

const PreSellIMacMockup = ({ content, ownerPlan }: PreSellIMacMockupProps) => {
  // Mockup screen dimensions
  const screenWidth = 512;
  
  // Target viewport dimensions (typical desktop)
  const viewportWidth = 1280;
  
  // Calculate scale
  const scale = screenWidth / viewportWidth;

  // Get background color for the screen
  const backgroundColor = content.backgroundType === 'gradient' 
    ? content.gradientStart 
    : content.backgroundColor;

  return (
    <div className="relative flex-shrink-0">
      {/* iMac Frame - responsive sizing */}
      <div 
        className="w-[400px] h-[262px] xl:w-[520px] xl:h-[340px] bg-gradient-to-b from-zinc-200 to-zinc-300 rounded-xl p-1 shadow-2xl"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)'
        }}
      >
        {/* Screen bezel */}
        <div className="w-full h-full bg-black rounded-lg p-[2px]">
          {/* Screen */}
          <div 
            className="w-full h-full bg-white rounded-md overflow-hidden relative"
            style={{ backgroundColor }}
          >
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
            
            {/* Content - scaled to fit properly */}
            <div 
              className="h-[calc(100%-24px)] w-full overflow-y-auto overflow-x-hidden imac-presell-scroll"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                backgroundColor
              }}
            >
              <style>
                {`
                  .imac-presell-scroll::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              <ScaledViewport viewportWidth={viewportWidth} scale={scale}>
                <div 
                  className="w-full relative" 
                  style={{ backgroundColor }}
                >
                  <PreSellTemplate 
                    content={content} 
                    isMobile={false} 
                    isPreview={true} 
                    ownerPlan={ownerPlan} 
                  />
                </div>
              </ScaledViewport>
            </div>
          </div>
        </div>
      </div>
      
      {/* iMac Stand */}
      <div className="flex flex-col items-center">
        {/* Chin */}
        <div className="w-[400px] xl:w-[520px] h-4 xl:h-5 bg-gradient-to-b from-zinc-300 to-zinc-400 rounded-b-xl flex items-center justify-center">
          <div className="w-8 xl:w-10 h-1 xl:h-1.5 bg-zinc-500/50 rounded-full" />
        </div>
        {/* Neck */}
        <div className="w-16 xl:w-20 h-10 xl:h-12 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-b" />
        {/* Base */}
        <div 
          className="w-24 xl:w-32 h-1.5 xl:h-2 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-b-xl"
          style={{
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    </div>
  );
};

export default PreSellIMacMockup;
