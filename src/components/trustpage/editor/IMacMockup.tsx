import { LandingPageFormData } from "@/types/landing-page";
import HighConversionTemplate from "../templates/HighConversionTemplate";
import SalesPageTemplate from "../templates/SalesPageTemplate";
import BioLinkTemplate from "../templates/BioLinkTemplate";
import HeroCaptureTemplate from "../templates/HeroCaptureTemplate";
import ScaledViewport from "./ScaledViewport";

interface IMacMockupProps {
  formData: LandingPageFormData;
}

const IMacMockup = ({ formData }: IMacMockupProps) => {
  const isSalesPage = formData.template_type === 'sales';
  const isBioPage = formData.template_type === 'bio';
  const isCaptureHero = formData.template_type === 'capture-hero';
  
  // Mockup screen dimensions
  const screenWidth = 512;
  const screenHeight = 306; // Accounting for browser chrome (24px)
  
  // Target viewport dimensions (typical desktop)
  const viewportWidth = 1280;
  
  // Calculate scale
  const scale = screenWidth / viewportWidth;

  return (
    <div className="relative">
      {/* iMac Frame */}
      <div 
        className="w-[520px] h-[340px] bg-gradient-to-b from-zinc-200 to-zinc-300 rounded-xl p-1 shadow-2xl"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)'
        }}
      >
        {/* Screen bezel */}
        <div className="w-full h-full bg-black rounded-lg p-[2px]">
          {/* Screen */}
          <div 
            className="w-full h-full bg-white rounded-md overflow-hidden relative"
            style={{ backgroundColor: formData.colors.background }}
          >
            {/* Browser chrome */}
            <div className="h-6 bg-zinc-800 flex items-center px-2 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="flex-1 mx-4">
                <div className="bg-zinc-700 rounded-md h-4 flex items-center justify-center">
                  <span className="text-[8px] text-zinc-400">trustpage.com/p/sua-pagina</span>
                </div>
              </div>
            </div>
            
            {/* Content - scaled to fit properly */}
            <div 
              className="h-[calc(100%-24px)] w-full overflow-y-auto overflow-x-hidden imac-scroll"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                backgroundColor: formData.colors.background
              }}
            >
              <style>
                {`
                  .imac-scroll::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              <ScaledViewport viewportWidth={viewportWidth} scale={scale}>
                <div 
                  className="w-full relative" 
                  style={{ 
                    backgroundColor: formData.colors.background,
                    minHeight: isCaptureHero ? `${Math.ceil(screenHeight / scale)}px` : 'auto',
                  }}
                >
                  {isSalesPage ? (
                    <SalesPageTemplate data={formData} isMobile={false} fullHeight={false} />
                  ) : isBioPage ? (
                    <BioLinkTemplate data={formData} isMobile={false} fullHeight={false} />
                  ) : isCaptureHero ? (
                    <HeroCaptureTemplate data={formData} isMobile={false} fullHeight={false} />
                  ) : (
                    <HighConversionTemplate data={formData} isMobile={false} fullHeight={false} />
                  )}
                </div>
              </ScaledViewport>
            </div>
          </div>
        </div>
      </div>
      
      {/* iMac Stand */}
      <div className="flex flex-col items-center">
        {/* Chin */}
        <div className="w-[520px] h-5 bg-gradient-to-b from-zinc-300 to-zinc-400 rounded-b-xl flex items-center justify-center">
          <div className="w-10 h-1.5 bg-zinc-500/50 rounded-full" />
        </div>
        {/* Neck */}
        <div className="w-20 h-12 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-b" />
        {/* Base */}
        <div 
          className="w-32 h-2 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-b-xl"
          style={{
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    </div>
  );
};

export default IMacMockup;
