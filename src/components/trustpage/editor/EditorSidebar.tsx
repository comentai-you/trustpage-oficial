import { LandingPageFormData, PageTheme, pageThemes } from "@/types/landing-page";
import { Slider } from "@/components/ui/slider";
import { Home, Monitor, Layers, Type } from "lucide-react";
import { Link } from "react-router-dom";

interface EditorSidebarProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
}

const EditorSidebar = ({ formData, onChange }: EditorSidebarProps) => {
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
    <aside className="w-72 bg-zinc-900 text-white flex flex-col h-full">
      {/* Navigation Icons */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <Home className="w-5 h-5 text-zinc-400" />
          </Link>
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center cursor-pointer transition-colors">
            <Layers className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Type className="w-5 h-5" />
          VSL Página
        </h2>
      </div>

      {/* Controls */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Title Size Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
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
          <label className="text-sm font-medium text-zinc-300">
            Tema da Página
          </label>
          <div className="space-y-2">
            {(Object.keys(pageThemes) as PageTheme[]).map((themeKey) => {
              const theme = pageThemes[themeKey];
              const isSelected = formData.theme === themeKey;
              
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => handleThemeChange(themeKey)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-primary/20 border-2 border-primary' 
                      : 'bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
                  }`}
                >
                  {/* Theme Preview Circle */}
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: theme.colors.background }}
                  >
                    <div 
                      className="w-5 h-2 rounded-full"
                      style={{ backgroundColor: theme.colors.buttonBg }}
                    />
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                    {theme.name}
                  </span>
                  {isSelected && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          TrustPage Editor v2.0
        </p>
      </div>
    </aside>
  );
};

export default EditorSidebar;
