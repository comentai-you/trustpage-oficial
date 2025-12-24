import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LandingPageFormData } from "@/types/landing-page";
import { MousePointer, MessageCircle, Link as LinkIcon, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AcoesTabProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
  userPlan?: 'essential' | 'elite';
}

const AcoesTab = ({ formData, onChange, userPlan = 'essential' }: AcoesTabProps) => {
  const isElite = userPlan === 'elite';

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
