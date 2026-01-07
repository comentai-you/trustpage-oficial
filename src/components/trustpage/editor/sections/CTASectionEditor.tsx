import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CTASection, SpacerSection } from "@/types/section-builder";
import { Button } from "@/components/ui/button";

interface CTASectionEditorProps {
  data: CTASection['data'];
  onChange: (data: CTASection['data']) => void;
}

export const CTASectionEditor = ({ data, onChange }: CTASectionEditorProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Texto do Botão</Label>
        <Input
          value={data.text || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="QUERO AGORA"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">URL</Label>
        <Input
          value={data.url || ''}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://..."
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Subtexto (opcional)</Label>
        <Input
          value={data.subtext || ''}
          onChange={(e) => onChange({ ...data, subtext: e.target.value })}
          placeholder="Garantia de 7 dias"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Tamanho</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={data.size === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, size: 'medium' })}
          >
            Médio
          </Button>
          <Button
            type="button"
            variant={data.size === 'large' || !data.size ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, size: 'large' })}
          >
            Grande
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SpacerSectionEditorProps {
  data: SpacerSection['data'];
  onChange: (data: SpacerSection['data']) => void;
}

export const SpacerSectionEditor = ({ data, onChange }: SpacerSectionEditorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Altura do Espaço</Label>
      <div className="flex gap-2">
        {(['sm', 'md', 'lg', 'xl'] as const).map((height) => (
          <Button
            key={height}
            type="button"
            variant={data.height === height ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, height })}
          >
            {height === 'sm' && 'P'}
            {height === 'md' && 'M'}
            {height === 'lg' && 'G'}
            {height === 'xl' && 'XG'}
          </Button>
        ))}
      </div>
    </div>
  );
};
