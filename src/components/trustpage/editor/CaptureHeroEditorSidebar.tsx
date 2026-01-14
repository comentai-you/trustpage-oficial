import { useState } from "react";
import { Input } from "@/components/ui/input";
import { InputWithAI } from "@/components/ui/input-with-ai";
import { Label } from "@/components/ui/label";
import { TextareaWithAI } from "@/components/ui/textarea-with-ai";
import { Button } from "@/components/ui/button";
import { LandingPageFormData } from "@/types/landing-page";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Type, Image, MousePointerClick, Palette, Sparkles, Upload, X, Loader2, BarChart3 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AIConfigDialog } from "@/components/ai/AIConfigDialog";

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

const CaptureHeroEditorSidebar = ({ formData, onChange, userPlan = 'free' }: CaptureHeroEditorSidebarProps) => {
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);

  const isPro = userPlan === 'pro' || userPlan === 'pro_yearly' || userPlan === 'elite';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { 
      toast.error("Selecione uma imagem"); 
      return; 
    }
    if (file.size > 5 * 1024 * 1024) { 
      toast.error("Máximo 5MB"); 
      return; 
    }

    setUploadingImage(true);
    try {
      const filePath = `${user.id}/capture-hero/hero_${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('uploads').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      if (data?.publicUrl) {
        onChange({ image_url: data.publicUrl });
      }
      toast.success("Imagem enviada!");
    } catch { 
      toast.error("Erro no upload"); 
    } finally { 
      setUploadingImage(false); 
      e.target.value = ''; 
    }
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

      <Accordion type="multiple" defaultValue={["content", "glow", "image", "cta"]} className="w-full">
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
              <Label className="text-xs text-gray-600">Nome da Página</Label>
              <Input 
                value={formData.page_name} 
                onChange={(e) => onChange({ page_name: e.target.value })} 
                placeholder="Minha Página de Captura" 
                className="text-sm" 
              />
            </div>
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
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Imagem Principal</Label>
              <p className="text-xs text-gray-400">
                Use uma imagem PNG sem fundo para o efeito flutuante ideal.
              </p>
              {formData.image_url ? (
                <div className="relative">
                  <div 
                    className="rounded-lg p-4 flex items-center justify-center"
                    style={{ backgroundColor: formData.colors.background || '#0f172a' }}
                  >
                    <img 
                      src={formData.image_url} 
                      alt="Hero preview" 
                      className="max-h-40 object-contain"
                      style={{
                        filter: `drop-shadow(0 10px 30px ${formData.primary_color || '#3b82f6'}40)`,
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => onChange({ image_url: '' })} 
                    className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors bg-gray-50">
                  {uploadingImage ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Clique para enviar</span>
                      <span className="text-xs text-gray-400 mt-1">PNG ou JPG até 5MB</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default CaptureHeroEditorSidebar;
