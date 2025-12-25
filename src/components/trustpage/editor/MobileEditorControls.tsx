import { LandingPageFormData, PageTheme, pageThemes } from "@/types/landing-page";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Globe, FileText, Video, MousePointer, Palette, Lightbulb } from "lucide-react";
import ImageUpload from "@/components/trustpage/ImageUpload";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const sizeToPercent = (size: number) => Math.round(((size - 1.5) / 2.5) * 100);
  const percentToSize = (percent: number) => 1.5 + (percent / 100) * 2.5;

  const buttonColorOptions = [
    { name: 'Verde', value: '#22C55E' },
    { name: 'Azul', value: '#2563EB' },
    { name: 'Vermelho', value: '#DC2626' },
    { name: 'Roxo', value: '#9333EA' },
    { name: 'Laranja', value: '#EA580C' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[320px] p-0 bg-white">
        <SheetHeader className="p-4 border-b border-gray-200">
          <SheetTitle className="text-gray-900">Editor VSL</SheetTitle>
        </SheetHeader>
        
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          <Accordion type="multiple" defaultValue={["config", "conteudo"]} className="w-full">
            
            {/* Seção 1: Configurações */}
            <AccordionItem value="config" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Configurações
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Nome do Link</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="meu-link"
                    className="bg-gray-50 border-gray-300"
                  />
                  <p className="text-xs text-gray-500">
                    trustpage.com/p/{formData.slug || 'seu-link'}
                  </p>
                </div>
                <ImageUpload
                  value={formData.profile_image_url}
                  onChange={(url) => onChange({ profile_image_url: url })}
                  label="Foto de Perfil"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Seção 2: Conteúdo */}
            <AccordionItem value="conteudo" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Conteúdo VSL
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Título</Label>
                  <Textarea
                    value={formData.headline}
                    onChange={(e) => onChange({ headline: e.target.value })}
                    placeholder="Seu título aqui..."
                    className="bg-gray-50 border-gray-300 min-h-[60px] resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">Tamanho</Label>
                    <span className="text-sm font-bold text-primary">{sizeToPercent(formData.headline_size || 2)}%</span>
                  </div>
                  <Slider
                    value={[sizeToPercent(formData.headline_size || 2)]}
                    onValueChange={(value) => onChange({ headline_size: percentToSize(value[0]) })}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                  <Textarea
                    value={formData.subheadline}
                    onChange={(e) => onChange({ subheadline: e.target.value })}
                    placeholder="Subtítulo opcional..."
                    className="bg-gray-50 border-gray-300 min-h-[50px] resize-none"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Seção 3: Vídeo */}
            <AccordionItem value="video" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  Vídeo & Capa
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">URL do Vídeo</Label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => onChange({ video_url: e.target.value })}
                    placeholder="https://vimeo.com/..."
                    className="bg-gray-50 border-gray-300"
                  />
                  <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-amber-800">
                      <span className="font-bold">Dica:</span> Use VIMEO para player sem anúncios.
                    </p>
                  </div>
                </div>
                <ImageUpload
                  value={formData.video_thumbnail_url}
                  onChange={(url) => onChange({ video_thumbnail_url: url })}
                  label="Capa do Vídeo"
                  aspectRatio="video"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Seção 4: CTA */}
            <AccordionItem value="cta" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-primary" />
                  Botão CTA
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Texto do Botão</Label>
                  <Input
                    value={formData.cta_text}
                    onChange={(e) => onChange({ cta_text: e.target.value })}
                    placeholder="QUERO COMPRAR AGORA"
                    className="bg-gray-50 border-gray-300 font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Link do Botão</Label>
                  <Input
                    value={formData.cta_url}
                    onChange={(e) => onChange({ cta_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Cor do Botão</Label>
                  <div className="flex flex-wrap gap-2">
                    {buttonColorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => onChange({ colors: { ...formData.colors, buttonBg: color.value } })}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          formData.colors.buttonBg === color.value 
                            ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-400' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Seção 5: Aparência */}
            <AccordionItem value="aparencia" className="border-b border-gray-200">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Aparência
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                <Label className="text-sm font-medium text-gray-700">Tema da Página</Label>
                <div className="space-y-2">
                  {(Object.keys(pageThemes) as PageTheme[]).map((themeKey) => {
                    const theme = pageThemes[themeKey];
                    const isSelected = formData.theme === themeKey;
                    
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => handleThemeChange(themeKey)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-primary/10 border-2 border-primary' 
                            : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200"
                          style={{ backgroundColor: theme.colors.background }}
                        >
                          <div 
                            className="w-4 h-1.5 rounded-full"
                            style={{ backgroundColor: theme.colors.buttonBg }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                          {theme.name}
                        </span>
                        {isSelected && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileEditorControls;
