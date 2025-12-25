import { LandingPageFormData } from "@/types/landing-page";
import HighConversionTemplate from "./templates/HighConversionTemplate";
import SalesPageTemplate from "./templates/SalesPageTemplate";

interface MobilePreviewProps {
  formData: LandingPageFormData;
}

const MobilePreview = ({ formData }: MobilePreviewProps) => {
  const isSalesPage = formData.template_type === 'sales';

  return (
    <div className="h-full flex items-center justify-center p-6">
      {/* iPhone Frame - Realistic */}
      <div className="relative">
        {/* Phone Frame with realistic styling */}
        <div 
          className="w-[320px] h-[650px] bg-gradient-to-b from-zinc-800 to-black rounded-[50px] p-[10px] shadow-2xl"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset'
          }}
        >
          {/* Side buttons - Volume */}
          <div className="absolute left-[-2px] top-[120px] w-[3px] h-[30px] bg-zinc-700 rounded-l-sm" />
          <div className="absolute left-[-2px] top-[160px] w-[3px] h-[50px] bg-zinc-700 rounded-l-sm" />
          <div className="absolute left-[-2px] top-[220px] w-[3px] h-[50px] bg-zinc-700 rounded-l-sm" />
          {/* Power button */}
          <div className="absolute right-[-2px] top-[180px] w-[3px] h-[80px] bg-zinc-700 rounded-r-sm" />
          
          {/* Dynamic Island */}
          <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-[8px] h-[8px] bg-zinc-800 rounded-full mr-[30px]" />
          </div>
          
          {/* Screen */}
          <div 
            className="w-full h-full bg-white rounded-[42px] overflow-hidden relative"
            style={{
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3) inset'
            }}
          >
            {/* Status Bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-12 flex items-end justify-between px-8 pb-1 text-xs font-semibold z-10" 
              style={{ color: formData.colors.text }}
            >
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-px">
                  <div className="w-[3px] h-[10px] rounded-sm" style={{ backgroundColor: formData.colors.text }} />
                  <div className="w-[3px] h-[12px] rounded-sm" style={{ backgroundColor: formData.colors.text }} />
                  <div className="w-[3px] h-[14px] rounded-sm" style={{ backgroundColor: formData.colors.text }} />
                  <div className="w-[3px] h-[16px] rounded-sm" style={{ backgroundColor: `${formData.colors.text}40` }} />
                </div>
                <svg className="w-6 h-3 ml-1" viewBox="0 0 24 12" fill={formData.colors.text}>
                  <rect x="0" y="0" width="21" height="12" rx="3" stroke={formData.colors.text} strokeWidth="1" fill="none"/>
                  <rect x="2" y="2" width="17" height="8" rx="1" fill={formData.colors.text}/>
                  <rect x="22" y="3" width="2" height="6" rx="1" fill={formData.colors.text}/>
                </svg>
              </div>
            </div>
            
            {/* Page Content - Hidden scrollbar */}
            <div 
              className="h-full overflow-y-auto pt-12"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <style>
                {`
                  .mobile-preview-scroll::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              <div className="mobile-preview-scroll">
                {isSalesPage ? (
                  <SalesPageTemplate data={formData} isMobile={true} />
                ) : (
                  <HighConversionTemplate data={formData} />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Reflection/Glow effect */}
        <div 
          className="absolute inset-0 rounded-[50px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}
        />
      </div>
    </div>
  );
};

export default MobilePreview;
