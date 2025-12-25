import { LandingPageFormData, PageTheme, pageThemes } from "@/types/landing-page";
import { Slider } from "@/components/ui/slider";
import { Type, Palette } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileEditorControlsProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileEditorControls = ({ formData, onChange, open, onOpenChange }: MobileEditorControlsProps) => {
  const handleThemeChange = (theme: PageTheme) => {
    const themeColors = pageThemes[theme].colors;
    onChange({ 
      theme,
      colors: themeColors
    });
  };

  // Convert rem to percentage (1.5rem = 0%, 4rem = 100%)
  const sizeToPercent = (size: number) => Math.round(((size - 1.5) / 2.5) * 100);
  const percentToSize = (percent: number) => 1.5 + (percent / 100) * 2.5;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">Personalizar Página</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 pb-6">
          {/* Title Size Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Type className="w-4 h-4" />
                Tamanho do Título
              </label>
              <span className="text-sm font-bold text-primary">
                {sizeToPercent(formData.headline_size || 2)}%
              </span>
            </div>
            <Slider
              value={[sizeToPercent(formData.headline_size || 2)]}
              onValueChange={(value) => onChange({ headline_size: percentToSize(value[0]) })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Theme Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Tema da Página
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(pageThemes) as PageTheme[]).map((themeKey) => {
                const theme = pageThemes[themeKey];
                const isSelected = formData.theme === themeKey;
                
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => handleThemeChange(themeKey)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-muted border-2 border-transparent'
                    }`}
                  >
                    <div 
                      className="w-full h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.background }}
                    >
                      <div 
                        className="w-8 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.buttonBg }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {theme.name.replace(' (Padrão)', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileEditorControls;
