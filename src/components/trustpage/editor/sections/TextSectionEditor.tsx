import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TextSection } from "@/types/section-builder";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface TextSectionEditorProps {
  data: TextSection['data'];
  onChange: (data: TextSection['data']) => void;
}

const TextSectionEditor = ({ data, onChange }: TextSectionEditorProps) => {
  return (
    <div className="space-y-4">
      {/* Content */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Conteúdo do Texto</Label>
        <Textarea
          value={data.content || ''}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="Escreva seu texto aqui..."
          className="text-sm resize-none min-h-[150px]"
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Dica: Use parágrafos para organizar seu texto de vendas
        </p>
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={data.alignment === 'left' || !data.alignment ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, alignment: 'left' })}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={data.alignment === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, alignment: 'center' })}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={data.alignment === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, alignment: 'right' })}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Max Width */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Largura Máxima</Label>
        <div className="flex gap-2">
          {(['sm', 'md', 'lg', 'full'] as const).map((width) => (
            <Button
              key={width}
              type="button"
              variant={data.maxWidth === width || (!data.maxWidth && width === 'lg') ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ ...data, maxWidth: width })}
            >
              {width === 'sm' && 'Pequena'}
              {width === 'md' && 'Média'}
              {width === 'lg' && 'Grande'}
              {width === 'full' && 'Total'}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextSectionEditor;
