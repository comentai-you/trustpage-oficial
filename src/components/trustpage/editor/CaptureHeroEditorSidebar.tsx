import { Input } from "@/components/ui/input";
import { InputWithAI } from "@/components/ui/input-with-ai";
import { Label } from "@/components/ui/label";
import { TextareaWithAI } from "@/components/ui/textarea-with-ai";
import { LandingPageFormData } from "@/types/landing-page";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Type, Image, MousePointerClick, Sparkles, BarChart3, Globe, FormInput
} from "lucide-react";
import CoverImageUpload from "./CoverImageUpload";
import { AIConfigDialog } from "@/components/ai/AIConfigDialog";
import ImageUpload from "@/components/trustpage/ImageUpload";

interface CaptureHeroEditorSidebarProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
  userPlan?: string;
}

// Preset glow themes
const glowPresets = [
  { id: 'blue-neon', name: 'Neon Azul', accent: '#3b82f6', bg: '#0f172a', bgSecondary: '#1e3a5f' },
  { id: 'purple-magic', name: 'Roxo Mágico', accent: '#8b5cf6', bg: '#1a1025', bgSecondary: '#2d1b4e' },
  { id: 'green-matrix', name: 'Verde Matrix', accent: '#22c55e', bg: '#0a1f0a', bgSecondary: '#143314' },
  { id: 'orange-fire', name: 'Laranja Fogo', accent: '#f97316', bg: '#1c1008', bgSecondary: '#2d1a0d' },
  { id: 'pink-cyber', name: 'Rosa Cyber', accent: '#ec4899', bg: '#1a0a14', bgSecondary: '#2d1225' },
  { id: 'cyan-tech', name: 'Ciano Tech', accent: '#06b6d4', bg: '#0a1a1f', bgSecondary: '#0d2833' },
];

// Convert rem to percentage - different ranges for mobile and desktop
const mobileSizeToPercent = (size: number) => Math.round(((size - 0.8) / 1.2) * 100);
const mobilePercentToSize = (percent: number) => 0.8 + (percent / 100) * 1.2;

const desktopSizeToPercent = (size: number) => Math.round(((size - 1.5) / 2.5) * 100);
const desktopPercentToSize = (percent: number) => 1.5 + (percent / 100) * 2.5;

const CaptureHeroEditorSidebar = ({ formData, onChange, userPlan = 'free' }: CaptureHeroEditorSidebarProps) => {

  const isPro = userPlan === 'pro' || userPlan === 'pro_yearly' || userPlan === 'elite';

  // Form fields configuration from content
  const formFields = (formData.content as any)?.formFields || {
    showName: true,
    showEmail: true,
    showPhone: false,
    showWhatsapp: false,
  };

  const updateFormFields = (updates: Partial<typeof formFields>) => {
    onChange({
      content: {
        ...(formData.content as any),
        formFields: { ...formFields, ...updates }
      }
    });
  };

  const handlePresetSelect = (preset: typeof glowPresets[0]) => {
    onChange({
      primary_color: preset.accent,
      colors: {
        ...formData.colors,
        background: preset.bg,
        primary: preset.bgSecondary,
        text: '#ffffff',
      }
    });
  };

  const currentPreset = glowPresets.find(p => 
    p.accent === formData.primary_color && p.bg === formData.colors.background
  );

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Editor Capture Hero</h2>
            <p className="text-sm text-gray-500">Página de captura de leads</p>
          </div>
          <AIConfigDialog />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["config", "content", "glow", "image", "cta", "form"]} className="w-full">
        
        {/* Page Configuration Section */}
        <AccordionItem value="config">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Globe className="w-4 h-4 text-primary" />
              Configurações da Página
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Nome da Página</Label>
              <Input 
                value={formData.page_name} 
                onChange={(e) => onChange({ page_name: e.target.value })} 
                placeholder="Minha Página de Captura" 
                className="text-sm" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Slug (URL)</Label>
              <Input 
                value={formData.slug} 
                onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} 
                placeholder="minha-pagina" 
                className="text-sm font-mono" 
              />
              <p className="text-[10px] text-muted-foreground">
                Sua página será acessível em: trustpage.com/{formData.slug || 'minha-pagina'}
              </p>
            </div>
            {/* Cover Image Upload - same as other templates */}
            <CoverImageUpload 
              coverImageUrl={formData.cover_image_url || ''} 
              onChange={(url) => onChange({ cover_image_url: url })} 
            />
          </AccordionContent>
        </AccordionItem>

        {/* Content Section */}
        <AccordionItem value="content">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Type className="w-4 h-4 text-primary" />
              Conteúdo
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Etiqueta (opcional)</Label>
              <InputWithAI 
                value={formData.subheadline || ''} 
                onChange={(e) => onChange({ subheadline: e.target.value })} 
                placeholder="Ex: VAGAS LIMITADAS" 
                className="text-sm"
                aiFieldType="headline"
                showAI={isPro}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Headline Principal</Label>
              <TextareaWithAI 
                value={formData.headline || ''} 
                onChange={(e) => onChange({ headline: e.target.value })} 
                placeholder="Sua headline impactante vai aqui..." 
                rows={3} 
                className="text-sm resize-none"
                aiFieldType="headline"
                showAI={isPro}
              />
            </div>

            {/* Headline Size Mobile */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">📱</span>
                  Tamanho Mobile
                </Label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {mobileSizeToPercent(formData.headline_size_mobile || 1.2)}%
                </span>
              </div>
              <Slider
                value={[mobileSizeToPercent(formData.headline_size_mobile || 1.2)]}
                onValueChange={(value) => onChange({ headline_size_mobile: mobilePercentToSize(value[0]) })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Headline Size Desktop */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">🖥️</span>
                  Tamanho Desktop
                </Label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {desktopSizeToPercent(formData.headline_size_desktop || 2.5)}%
                </span>
              </div>
              <Slider
                value={[desktopSizeToPercent(formData.headline_size_desktop || 2.5)]}
                onValueChange={(value) => onChange({ headline_size_desktop: desktopPercentToSize(value[0]) })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Descrição</Label>
              <TextareaWithAI 
                value={formData.description || ''} 
                onChange={(e) => onChange({ description: e.target.value })} 
                placeholder="Descrição persuasiva sobre o benefício..." 
                rows={3} 
                className="text-sm resize-none"
                aiFieldType="body"
                showAI={isPro}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Form Fields Configuration */}
        <AccordionItem value="form">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FormInput className="w-4 h-4 text-primary" />
              Campos do Formulário
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <p className="text-xs text-gray-500">
              Configure quais dados você deseja coletar dos seus leads.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm">👤</span>
                  <Label className="text-sm text-gray-700">Nome</Label>
                </div>
                <Switch
                  checked={formFields.showName}
                  onCheckedChange={(checked) => updateFormFields({ showName: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📧</span>
                  <Label className="text-sm text-gray-700">E-mail</Label>
                </div>
                <Switch
                  checked={formFields.showEmail}
                  onCheckedChange={(checked) => updateFormFields({ showEmail: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📱</span>
                  <Label className="text-sm text-gray-700">Telefone</Label>
                </div>
                <Switch
                  checked={formFields.showPhone}
                  onCheckedChange={(checked) => updateFormFields({ showPhone: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💬</span>
                  <Label className="text-sm text-gray-700">WhatsApp</Label>
                </div>
                <Switch
                  checked={formFields.showWhatsapp}
                  onCheckedChange={(checked) => updateFormFields({ showWhatsapp: checked })}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Glow/Theme Section */}
        <AccordionItem value="glow">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              Estilo do Glow
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Temas Pré-definidos</Label>
              <div className="grid grid-cols-2 gap-2">
                {glowPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      currentPreset?.id === preset.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: preset.bg }}
                  >
                    <div 
                      className="w-full h-6 rounded-md mb-2"
                      style={{ 
                        background: `linear-gradient(135deg, ${preset.accent}60, ${preset.bgSecondary})`,
                        boxShadow: `0 0 15px ${preset.accent}40`
                      }}
                    />
                    <span className="text-xs text-white/80">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs text-gray-600 font-medium">Cores Personalizadas</Label>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Cor do Glow (Accent)</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primary_color || '#3b82f6'}
                    onChange={(e) => onChange({ primary_color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <Input
                    value={formData.primary_color || '#3b82f6'}
                    onChange={(e) => onChange({ primary_color: e.target.value })}
                    placeholder="#3b82f6"
                    className="text-sm font-mono flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Fundo Principal</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.colors.background || '#0f172a'}
                    onChange={(e) => onChange({ 
                      colors: { ...formData.colors, background: e.target.value } 
                    })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <Input
                    value={formData.colors.background || '#0f172a'}
                    onChange={(e) => onChange({ 
                      colors: { ...formData.colors, background: e.target.value } 
                    })}
                    placeholder="#0f172a"
                    className="text-sm font-mono flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Fundo Secundário (Gradiente)</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.colors.primary || '#1e293b'}
                    onChange={(e) => onChange({ 
                      colors: { ...formData.colors, primary: e.target.value } 
                    })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <Input
                    value={formData.colors.primary || '#1e293b'}
                    onChange={(e) => onChange({ 
                      colors: { ...formData.colors, primary: e.target.value } 
                    })}
                    placeholder="#1e293b"
                    className="text-sm font-mono flex-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Hero Image Section */}
        <AccordionItem value="image">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Image className="w-4 h-4 text-primary" />
              Imagem Hero
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">📐 Tamanho recomendado:</p>
              <p className="text-xs text-blue-600">
                • Desktop: <span className="font-mono font-semibold">800x600px</span> ou maior<br/>
                • Use imagem <span className="font-semibold">PNG sem fundo</span> para efeito flutuante
              </p>
            </div>
            <ImageUpload
              value={formData.image_url || ''}
              onChange={(url) => onChange({ image_url: url })}
              label="Imagem Principal (Hero)"
              hint="PNG transparente recomendado - até 5MB"
            />
          </AccordionContent>
        </AccordionItem>

        {/* CTA Section */}
        <AccordionItem value="cta">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MousePointerClick className="w-4 h-4 text-primary" />
              Call to Action
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Texto do Botão</Label>
              <InputWithAI 
                value={formData.cta_text || ''} 
                onChange={(e) => onChange({ cta_text: e.target.value })} 
                placeholder="GARANTIR MEU LUGAR AGORA!" 
                className="text-sm"
                aiFieldType="button"
                showAI={isPro}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">URL de Destino</Label>
              <Input 
                value={formData.cta_url || ''} 
                onChange={(e) => onChange({ cta_url: e.target.value })} 
                placeholder="https://seulink.com/checkout" 
                className="text-sm" 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tracking Section */}
        <AccordionItem value="tracking">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="w-4 h-4 text-primary" />
              Rastreamento
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Facebook Pixel ID</Label>
              <Input 
                value={formData.facebook_pixel_id || ''} 
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                  onChange({ facebook_pixel_id: value });
                }} 
                placeholder="Ex: 123456789012345" 
                className="text-sm font-mono" 
                maxLength={16}
                pattern="[0-9]*"
                inputMode="numeric"
              />
              <p className="text-[10px] text-muted-foreground">
                Cole o ID do seu Pixel (15-16 dígitos) para rastrear PageViews.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Google Tag (GTM/GA4)</Label>
              <Input 
                value={formData.google_tag_id || ''} 
                onChange={(e) => onChange({ google_tag_id: e.target.value })} 
                placeholder="Ex: GTM-XXXXXXX ou G-XXXXXXXXXX" 
                className="text-sm font-mono" 
              />
              <p className="text-[10px] text-muted-foreground">
                Cole seu ID do Google Tag Manager (GTM-) ou Google Analytics 4 (G-).
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default CaptureHeroEditorSidebar;