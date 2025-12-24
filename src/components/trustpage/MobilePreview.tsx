import { LandingPageFormData } from "@/types/landing-page";
import HighConversionTemplate from "./templates/HighConversionTemplate";

interface MobilePreviewProps {
  formData: LandingPageFormData;
}

const MobilePreview = ({ formData }: MobilePreviewProps) => {
  return (
    <div className="h-full flex items-center justify-center p-6">
      {/* iPhone Frame */}
      <div className="relative">
        {/* Phone Frame */}
        <div className="w-[320px] h-[650px] bg-black rounded-[45px] p-2 shadow-2xl">
          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
          
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[38px] overflow-hidden relative">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-10 flex items-end justify-between px-6 pb-1 text-xs font-medium z-10" 
              style={{ color: formData.colors.text }}>
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-px">
                  <div className="w-1 h-2.5 rounded-sm" style={{ backgroundColor: formData.colors.text }} />
                  <div className="w-1 h-3 rounded-sm" style={{ backgroundColor: formData.colors.text }} />
                  <div className="w-1 h-3.5 rounded-sm" style={{ backgroundColor: formData.colors.text }} />
                  <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: `${formData.colors.text}40` }} />
                </div>
                <span className="ml-1">100%</span>
              </div>
            </div>
            
            {/* Page Content */}
            <div className="h-full overflow-y-auto pt-10">
              <HighConversionTemplate data={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePreview;
