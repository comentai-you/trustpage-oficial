import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LandingPageFormData } from "@/types/landing-page";
import { MousePointer, MessageCircle, Link as LinkIcon, Lock, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AcoesTabProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
  userPlan?: 'essential' | 'elite';
}

const AcoesTab = ({ formData, onChange, userPlan = 'essential' }: AcoesTabProps) => {
  const isElite = userPlan === 'elite';

  const handleColorChange = (colorKey: keyof typeof formData.colors, value: string) => {
    onChange({
      colors: {
        ...formData.colors,
        [colorKey]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* CTA Text */}
      <div className="space-y-2">
        <Label htmlFor="cta_text" className="flex items-center gap-2">
          <MousePointer className="w-4 h-4" />
          Texto do Botão
        </Label>
        <Input
          id="cta_text"
          placeholder="Ex: QUERO AGORA"
          value={formData.cta_text}
          onChange={(e) => onChange({ cta_text: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Use verbos de ação: "COMPRAR", "ACESSAR", "GARANTIR"
        </p>
      </div>

      {/* Button Colors */}
      <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
        <Label className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Cores do Botão
        </Label>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Button Background Color */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Cor de Fundo</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.colors.buttonBg}
                onChange={(e) => handleColorChange('buttonBg', e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={formData.colors.buttonBg}
                onChange={(e) => handleColorChange('buttonBg', e.target.value)}
                className="flex-1 h-10 font-mono text-xs"
                placeholder="#22C55E"
              />
            </div>
          </div>

          {/* Button Text Color */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Cor do Texto</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.colors.buttonText}
                onChange={(e) => handleColorChange('buttonText', e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={formData.colors.buttonText}
                onChange={(e) => handleColorChange('buttonText', e.target.value)}
                className="flex-1 h-10 font-mono text-xs"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">Prévia:</p>
          <button
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{ 
              backgroundColor: formData.colors.buttonBg, 
              color: formData.colors.buttonText 
            }}
          >
            {formData.cta_text || 'QUERO AGORA'}
          </button>
        </div>
      </div>

      {/* CTA URL */}
      <div className="space-y-2">
        <Label htmlFor="cta_url" className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Link de Checkout/Vendas
        </Label>
        <Input
          id="cta_url"
          type="url"
          placeholder="https://pay.hotmart.com/..."
          value={formData.cta_url}
          onChange={(e) => onChange({ cta_url: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Link para onde o botão principal redireciona
        </p>
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Número do WhatsApp
        </Label>
        <Input
          id="whatsapp_number"
          placeholder="5511999999999"
          value={formData.whatsapp_number}
          onChange={(e) => onChange({ whatsapp_number: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Código do país + DDD + número (sem espaços)
        </p>
      </div>

      {/* Advanced Settings Section */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Configurações Avançadas
        </h3>

        {/* Tracking Pixel */}
        <div className="space-y-2">
          <Label 
            htmlFor="pix_pixel_id" 
            className={`flex items-center gap-2 ${!isElite ? 'text-muted-foreground' : ''}`}
          >
            <Lock className="w-4 h-4" />
            Pixel de Rastreio
            {!isElite && (
              <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-600 border-amber-500/20">
                Recurso Elite
              </Badge>
            )}
          </Label>
          <Input
            id="pix_pixel_id"
            placeholder="ID do seu pixel"
            value={formData.pix_pixel_id}
            onChange={(e) => onChange({ pix_pixel_id: e.target.value })}
            disabled={!isElite}
            className={!isElite ? 'opacity-50 cursor-not-allowed' : ''}
          />
          {!isElite && (
            <p className="text-xs text-amber-600">
              Faça upgrade para o plano Elite para rastrear conversões
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcoesTab;
