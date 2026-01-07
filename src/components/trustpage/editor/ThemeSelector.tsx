import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SalesTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    text: string;
    primary: string;
  };
}

export const salesThemes: SalesTheme[] = [
  {
    id: 'dark-conversion',
    name: 'Conversão Dark',
    description: 'PLR, Nicho Black, Renda Extra',
    colors: {
      background: '#09090b',
      text: '#ffffff',
      primary: '#22c55e'
    }
  },
  {
    id: 'clean-trust',
    name: 'Confiança Clean',
    description: 'Médicos, Advogados, Software',
    colors: {
      background: '#ffffff',
      text: '#1f2937',
      primary: '#2563eb'
    }
  },
  {
    id: 'urgency-offer',
    name: 'Urgência & Oferta',
    description: 'Produtos Físicos, Promoções',
    colors: {
      background: '#f3f4f6',
      text: '#000000',
      primary: '#dc2626'
    }
  },
  {
    id: 'royalty-premium',
    name: 'Royalty Premium',
    description: 'Beleza, Estética, Mentoria',
    colors: {
      background: '#1e1b4b',
      text: '#f8fafc',
      primary: '#a855f7'
    }
  },
  {
    id: 'femme-luxury',
    name: 'Femme Luxury',
    description: 'Beleza, Moda, Estética',
    colors: {
      background: '#faf9f7',
      text: '#374151',
      primary: '#b76e79'
    }
  },
  {
    id: 'money-maker',
    name: 'Money Maker',
    description: 'Finanças, Investimentos, Crypto',
    colors: {
      background: '#0f172a',
      text: '#ffffff',
      primary: '#22c55e'
    }
  },
  {
    id: 'energy-fit',
    name: 'Energy Fit',
    description: 'Fitness, Suplementos, Academia',
    colors: {
      background: '#1c1c1e',
      text: '#ffffff',
      primary: '#f97316'
    }
  },
  {
    id: 'organic-life',
    name: 'Organic Life',
    description: 'Produtos Naturais, Saúde',
    colors: {
      background: '#fefcf3',
      text: '#5c4033',
      primary: '#4ade80'
    }
  }
];

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (theme: SalesTheme) => void;
}

const ThemeSelector = ({ selectedThemeId, onSelectTheme }: ThemeSelectorProps) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Escolha um tema profissional para sua página
      </p>
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {salesThemes.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme)}
              className={cn(
                "relative p-2.5 rounded-lg border-2 transition-all text-left",
                "hover:shadow-md hover:scale-[1.02]",
                isSelected 
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              
              {/* Color preview circles */}
              <div className="flex gap-1.5 mb-2">
                <div 
                  className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: theme.colors.background }}
                  title="Cor de fundo"
                />
                <div 
                  className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: theme.colors.text }}
                  title="Cor do texto"
                />
                <div 
                  className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: theme.colors.primary }}
                  title="Cor do botão"
                />
              </div>
              
              {/* Theme info */}
              <h4 className="text-xs font-semibold text-gray-900 leading-tight">
                {theme.name}
              </h4>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
