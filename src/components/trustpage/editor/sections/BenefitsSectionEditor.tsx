import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BenefitsSection } from "@/types/section-builder";
import { Plus, Trash2 } from "lucide-react";
import IconSelector from "../IconSelector";

interface BenefitsSectionEditorProps {
  data: BenefitsSection['data'];
  onChange: (data: BenefitsSection['data']) => void;
}

const BenefitsSectionEditor = ({ data, onChange }: BenefitsSectionEditorProps) => {
  const addItem = () => {
    const newItem = {
      id: `benefit_${Date.now()}`,
      title: 'Novo Benefício',
      description: 'Descrição do benefício',
      icon: 'Sparkles'
    };
    onChange({ ...data, items: [...(data.items || []), newItem] });
  };

  const updateItem = (index: number, updates: Partial<typeof data.items[0]>) => {
    const newItems = [...(data.items || [])];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = (data.items || []).filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Título da Seção</Label>
        <Input
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Por que escolher"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Estilo</Label>
        <div className="flex gap-2">
          {(['cards', 'checklist', 'icons'] as const).map((style) => (
            <Button
              key={style}
              type="button"
              variant={data.style === style ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ ...data, style })}
            >
              {style === 'cards' && 'Cards'}
              {style === 'checklist' && 'Checklist'}
              {style === 'icons' && 'Ícones'}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Benefícios ({data.items?.length || 0})</Label>
        {(data.items || []).map((item, index) => (
          <div key={item.id} className="p-3 border border-border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <IconSelector
                value={item.icon || 'Sparkles'}
                onChange={(icon) => updateItem(index, { icon })}
              />
              <Input
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="Título"
                className="text-sm flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={item.description || ''}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              placeholder="Descrição"
              className="text-sm resize-none"
              rows={2}
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Adicionar Benefício
        </Button>
      </div>
    </div>
  );
};

export default BenefitsSectionEditor;
