import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { LandingPageFormData, PageTheme, pageThemes } from "@/types/landing-page";
import { Type, FileText, Video, Palette, SlidersHorizontal } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface ConteudoTabProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
}

const ConteudoTab = ({ formData, onChange }: ConteudoTabProps) => {
  const handleThemeChange = (theme: PageTheme) => {
    const themeColors = pageThemes[theme].colors;
    onChange({ 
      theme,
      colors: themeColors
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Tema da Página
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(pageThemes) as PageTheme[]).map((themeKey) => {
            const theme = pageThemes[themeKey];
            const isSelected = formData.theme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => handleThemeChange(themeKey)}
                className={`relative p-3 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {/* Theme Preview */}
                <div 
                  className="w-full h-12 rounded-lg mb-2 flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.background }}
                >
                  <div 
                    className="w-8 h-3 rounded-full"
                    style={{ backgroundColor: theme.colors.buttonBg }}
                  />
                </div>
                <span className="text-xs font-medium">{theme.name}</span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="headline" className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          Headline Principal
        </Label>
        <Textarea
          id="headline"
          placeholder="Ex: Descubra Como Emagrecer 10kg em 30 Dias Sem Dieta Restritiva"
          value={formData.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Título principal que aparece em destaque
        </p>
      </div>

      {/* Headline Size Slider */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Tamanho do Título
        </Label>
        <div className="px-1">
          <Slider
            value={[formData.headline_size || 2]}
            onValueChange={(value) => onChange({ headline_size: value[0] })}
            min={1.5}
            max={4}
            step={0.25}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Pequeno</span>
            <span className="font-medium">{formData.headline_size || 2}rem</span>
            <span>Grande</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Descrição (Opcional)
        </Label>
        <Textarea
          id="description"
          placeholder="Uma breve descrição do seu produto ou serviço..."
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
        />
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <Label htmlFor="video_url" className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          Link do Vídeo (YouTube/Vimeo)
        </Label>
        <Input
          id="video_url"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={formData.video_url}
          onChange={(e) => onChange({ video_url: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Cole o link do YouTube ou Vimeo
        </p>
      </div>

      {/* Video Thumbnail Upload */}
      <ImageUpload
        value={formData.video_thumbnail_url}
        onChange={(url) => onChange({ video_thumbnail_url: url })}
        label="Capa do Vídeo (Thumbnail)"
        hint="Imagem que aparece antes do play (16:9)"
        aspectRatio="video"
      />
    </div>
  );
};

export default ConteudoTab;
