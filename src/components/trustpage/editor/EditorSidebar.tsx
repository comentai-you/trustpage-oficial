import { LandingPageFormData, PageTheme, pageThemes } from "@/types/landing-page";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Home, Monitor, Layers, Settings, FileText, Video, MousePointer, Palette, Globe, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import ImageUpload from "@/components/trustpage/ImageUpload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const buttonColorOptions = [
    { name: 'Verde', value: '#22C55E' },
    { name: 'Azul', value: '#2563EB' },
    { name: 'Vermelho', value: '#DC2626' },
    { name: 'Roxo', value: '#9333EA' },
    { name: 'Laranja', value: '#EA580C' },
  ];

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Navigation Icons */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="w-10 h-10 rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
            <Layers className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Editor VSL
        </h2>
        <p className="text-xs text-gray-500 mt-1">Configure sua página de vendas</p>
      </div>

      {/* Accordion Sections */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={["config", "conteudo", "video", "cta", "aparencia"]} className="w-full">
          
          {/* Seção 1: Configurações da Página */}
          <AccordionItem value="config" className="border-b border-gray-200">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Configurações da Página
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Slug Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Nome do Link (Slug)
                </Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="meu-link"
                  className="bg-gray-50 border-gray-300 focus:border-primary"
                />
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                  <span className="font-medium">Preview:</span>
                  <span className="text-primary font-mono">trustpage.com/p/{formData.slug || 'seu-link'}</span>
                </div>
              </div>

              {/* Profile Image */}
              <ImageUpload
                value={formData.profile_image_url}
                onChange={(url) => onChange({ profile_image_url: url })}
                label="Foto de Perfil"
                hint="Aparece no topo da página"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Seção 2: Conteúdo VSL */}
          <AccordionItem value="conteudo" className="border-b border-gray-200">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Conteúdo VSL
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Headline */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Título (Headline)
                </Label>
                <Textarea
                  value={formData.headline}
                  onChange={(e) => onChange({ headline: e.target.value })}
                  placeholder="Descubra o Segredo Para..."
                  className="bg-gray-50 border-gray-300 focus:border-primary min-h-[80px] resize-none"
                />
              </div>

              {/* Headline Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    Tamanho do Título
                  </Label>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
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

              {/* Subheadline */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Descrição (Subtítulo)
                </Label>
                <Textarea
                  value={formData.subheadline}
                  onChange={(e) => onChange({ subheadline: e.target.value })}
                  placeholder="Uma breve descrição que complementa o título..."
                  className="bg-gray-50 border-gray-300 focus:border-primary min-h-[60px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção 3: Vídeo & Capa */}
          <AccordionItem value="video" className="border-b border-gray-200">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Vídeo & Capa
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Video URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  URL do Vídeo
                </Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => onChange({ video_url: e.target.value })}
                  placeholder="https://vimeo.com/..."
                  className="bg-gray-50 border-gray-300 focus:border-primary"
                />
                {/* Pro Tip Alert */}
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">Dica Pro:</span> Recomendamos fortemente usar{' '}
                    <span className="font-bold text-amber-900">VIMEO</span> para um player mais limpo, 
                    profissional e sem anúncios concorrentes.
                  </p>
                </div>
              </div>

              {/* Thumbnail */}
              <ImageUpload
                value={formData.video_thumbnail_url}
                onChange={(url) => onChange({ video_thumbnail_url: url })}
                label="Thumbnail (Capa do Vídeo)"
                hint="Aparece antes do play"
                aspectRatio="video"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Seção 4: Botão de Ação (CTA) */}
          <AccordionItem value="cta" className="border-b border-gray-200">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-primary" />
                Botão de Ação (CTA)
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* CTA Text */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Texto do Botão
                </Label>
                <Input
                  value={formData.cta_text}
                  onChange={(e) => onChange({ cta_text: e.target.value })}
                  placeholder="QUERO COMPRAR AGORA"
                  className="bg-gray-50 border-gray-300 focus:border-primary font-semibold"
                />
              </div>

              {/* CTA URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Link do Botão
                </Label>
                <Input
                  value={formData.cta_url}
                  onChange={(e) => onChange({ cta_url: e.target.value })}
                  placeholder="https://checkout.com/seu-produto"
                  className="bg-gray-50 border-gray-300 focus:border-primary"
                />
              </div>

              {/* Button Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Cor do Botão
                </Label>
                <div className="flex flex-wrap gap-2">
                  {buttonColorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => onChange({ 
                        colors: { 
                          ...formData.colors, 
                          buttonBg: color.value 
                        } 
                      })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.colors.buttonBg === color.value 
                          ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
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
              <Label className="text-sm font-medium text-gray-700">
                Tema da Página
              </Label>
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
                          ? 'bg-primary/10 border-2 border-primary' 
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {/* Theme Preview Circle */}
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner border border-gray-200"
                        style={{ backgroundColor: theme.colors.background }}
                      >
                        <div 
                          className="w-5 h-2 rounded-full"
                          style={{ backgroundColor: theme.colors.buttonBg }}
                        />
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          TrustPage Editor v2.0
        </p>
      </div>
    </aside>
  );
};

export default EditorSidebar;
