import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { OfferSection } from "@/types/section-builder";
import { Plus, Trash2, Check } from "lucide-react";

interface OfferSectionEditorProps {
  data: OfferSection['data'];
  onChange: (data: OfferSection['data']) => void;
}

const OfferSectionEditor = ({ data, onChange }: OfferSectionEditorProps) => {
  const addBenefit = () => {
    const newBenefit = {
      id: `benefit_${Date.now()}`,
      text: 'Novo benefício'
    };
    onChange({ ...data, benefits: [...(data.benefits || []), newBenefit] });
  };

  const updateBenefit = (index: number, text: string) => {
    const newBenefits = [...(data.benefits || [])];
    newBenefits[index] = { ...newBenefits[index], text };
    onChange({ ...data, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = (data.benefits || []).filter((_, i) => i !== index);
    onChange({ ...data, benefits: newBenefits });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Título da Oferta</Label>
        <Input
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Oferta Especial"
          className="text-sm"
        />
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Subtítulo (opcional)</Label>
        <Input
          value={data.subtitle || ''}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="Por tempo limitado"
          className="text-sm"
        />
      </div>

      {/* Pricing */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-xs text-muted-foreground font-medium">Preços</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Preço Original (riscado)</Label>
            <Input
              value={data.originalPrice || ''}
              onChange={(e) => onChange({ ...data, originalPrice: e.target.value })}
              placeholder="R$ 497,00"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Preço Final</Label>
            <Input
              value={data.finalPrice || ''}
              onChange={(e) => onChange({ ...data, finalPrice: e.target.value })}
              placeholder="R$ 97,00"
              className="text-sm font-bold"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Parcelamento (opcional)</Label>
          <Input
            value={data.installments || ''}
            onChange={(e) => onChange({ ...data, installments: e.target.value })}
            placeholder="ou 12x de R$ 9,70"
            className="text-sm"
          />
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-xs text-muted-foreground font-medium">
          Benefícios Inclusos ({data.benefits?.length || 0})
        </Label>
        
        {(data.benefits || []).map((benefit, index) => (
          <div key={benefit.id} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <Input
              value={benefit.text}
              onChange={(e) => updateBenefit(index, e.target.value)}
              placeholder="Benefício"
              className="text-sm flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive"
              onClick={() => removeBenefit(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <Button type="button" variant="outline" size="sm" onClick={addBenefit} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Adicionar Benefício
        </Button>
      </div>

      {/* CTA Button */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-xs text-muted-foreground font-medium">Botão de Compra</Label>
        
        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground">Texto do Botão</Label>
          <Input
            value={data.ctaText || ''}
            onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
            placeholder="QUERO APROVEITAR AGORA"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground">Link do Botão</Label>
          <Input
            value={data.ctaUrl || ''}
            onChange={(e) => onChange({ ...data, ctaUrl: e.target.value })}
            placeholder="https://..."
            className="text-sm"
          />
        </div>
      </div>

      {/* Guarantee */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-xs">Mostrar Garantia</Label>
            <p className="text-[10px] text-muted-foreground">
              Selo de garantia abaixo do botão
            </p>
          </div>
          <Switch
            checked={data.showGuarantee || false}
            onCheckedChange={(checked) => onChange({ ...data, showGuarantee: checked })}
          />
        </div>

        {data.showGuarantee && (
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground">Texto da Garantia</Label>
            <Textarea
              value={data.guaranteeText || ''}
              onChange={(e) => onChange({ ...data, guaranteeText: e.target.value })}
              placeholder="7 dias de garantia incondicional"
              className="text-sm resize-none"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferSectionEditor;