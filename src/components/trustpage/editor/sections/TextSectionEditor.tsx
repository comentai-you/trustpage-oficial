import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { TextSection } from "@/types/section-builder";
import { AlignLeft, AlignCenter, AlignRight, Bold } from "lucide-react";

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
          className="text-sm resize-none min-h-[120px]"
          rows={5}
        />
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Tamanho do Texto</Label>
          <span className="text-xs font-medium">{data.fontSize || 18}px</span>
        </div>
        <Slider
          value={[data.fontSize || 18]}
          onValueChange={([value]) => onChange({ ...data, fontSize: value })}
          min={12}
          max={48}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>12px</span>
          <span>48px</span>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Cor do Texto</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={data.textColor || '#333333'}
            onChange={(e) => onChange({ ...data, textColor: e.target.value })}
            className="w-12 h-8 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={data.textColor || '#333333'}
            onChange={(e) => onChange({ ...data, textColor: e.target.value })}
            placeholder="#333333"
            className="flex-1 text-xs h-8"
          />
        </div>
      </div>

      {/* Bold & Alignment Row */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Estilo e Alinhamento</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={data.isBold ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, isBold: !data.isBold })}
            className="h-8 w-8 p-0"
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            type="button"
            variant={data.alignment === 'left' || !data.alignment ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, alignment: 'left' })}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={data.alignment === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, alignment: 'center' })}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={data.alignment === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, alignment: 'right' })}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Max Width */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Largura do Bloco</Label>
        <div className="grid grid-cols-4 gap-1">
          {(['sm', 'md', 'lg', 'full'] as const).map((width) => (
            <Button
              key={width}
              type="button"
              variant={data.maxWidth === width || (!data.maxWidth && width === 'lg') ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ ...data, maxWidth: width })}
              className="h-7 text-xs px-2"
            >
              {width === 'sm' && 'P'}
              {width === 'md' && 'M'}
              {width === 'lg' && 'G'}
              {width === 'full' && '100%'}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextSectionEditor;
