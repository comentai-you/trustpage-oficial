import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// 5 preset colors for text customization
const textColorPresets = [
  { id: 'white', color: '#ffffff', name: 'Branco' },
  { id: 'black', color: '#000000', name: 'Preto' },
  { id: 'yellow', color: '#fbbf24', name: 'Amarelo' },
  { id: 'green', color: '#22c55e', name: 'Verde' },
  { id: 'accent', color: 'accent', name: 'Accent' }, // Uses theme accent color
];

interface TextColorPickerProps {
  label: string;
  value: string | undefined;
  onChange: (color: string) => void;
  accentColor: string;
}

const TextColorPicker = ({ label, value, onChange, accentColor }: TextColorPickerProps) => {
  // Resolve 'accent' to actual accent color for comparison
  const getResolvedColor = (presetColor: string) => {
    return presetColor === 'accent' ? accentColor : presetColor;
  };

  const selectedPreset = textColorPresets.find(p => 
    getResolvedColor(p.color) === value
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="flex gap-2">
        {textColorPresets.map((preset) => {
          const resolvedColor = getResolvedColor(preset.color);
          const isSelected = value === resolvedColor;
          
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(resolvedColor)}
              title={preset.name}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                "hover:scale-110 hover:shadow-md",
                isSelected 
                  ? "border-primary ring-2 ring-primary/30" 
                  : "border-gray-300"
              )}
              style={{ backgroundColor: resolvedColor }}
            >
              {isSelected && (
                <Check 
                  className="w-4 h-4" 
                  style={{ 
                    color: resolvedColor === '#ffffff' || resolvedColor === '#fbbf24' 
                      ? '#000000' 
                      : '#ffffff' 
                  }} 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TextColorPicker;
