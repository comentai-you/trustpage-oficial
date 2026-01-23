import { Label } from "@/components/ui/label";
import { TextareaWithAI } from "@/components/ui/textarea-with-ai";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { HeadlineSection } from "@/types/section-builder";
import { 
  Type, 
  Smartphone, 
  Monitor, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Minus,
  Sparkles
} from "lucide-react";

interface HeadlineSectionEditorProps {
  data: HeadlineSection['data'];
  onChange: (data: HeadlineSection['data']) => void;
}

const HeadlineSectionEditor = ({ data, onChange }: HeadlineSectionEditorProps) => {
  const alignments = [
    { value: 'left', icon: AlignLeft, label: 'Esquerda' },
    { value: 'center', icon: AlignCenter, label: 'Centro' },
    { value: 'right', icon: AlignRight, label: 'Direita' },
  ] as const;

  const fontWeights = [
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semibold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' },
  ] as const;

  const decorations = [
    { value: 'none', label: 'Nenhum' },
    { value: 'underline', label: 'Sublinhado' },
    { value: 'gradient-underline', label: 'Sublinhado Gradiente' },
    { value: 'highlight', label: 'Destaque' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Headline Text */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <Type className="w-3 h-3" />
          Texto do Título
        </Label>
        <TextareaWithAI
          value={data.text || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Digite seu título impactante aqui..."
          className="text-sm resize-none"
          rows={2}
          aiFieldType="headline"
        />
      </div>

      {/* Tag/Label acima do título */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Tag Superior
          </Label>
          <Switch
            checked={data.showTag ?? false}
            onCheckedChange={(checked) => onChange({ ...data, showTag: checked })}
          />
        </div>
        {data.showTag && (
          <TextareaWithAI
            value={data.tagText || ''}
            onChange={(e) => onChange({ ...data, tagText: e.target.value })}
            placeholder="Ex: ⚡ Novidade"
            className="text-sm resize-none"
            rows={1}
            aiFieldType="subheadline"
          />
        )}
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <div className="flex gap-1">
          {alignments.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              type="button"
              variant={data.alignment === value ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => onChange({ ...data, alignment: value })}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Typography Section */}
      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
        <Label className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
          <Type className="w-3 h-3" />
          Tipografia
        </Label>
        
        {/* Font Size - Mobile */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="w-3 h-3" />
            <span>Tamanho Mobile</span>
            <span className="ml-auto font-mono">{data.sizeMobile || 1.5}rem</span>
          </div>
          <Slider
            value={[data.sizeMobile || 1.5]}
            onValueChange={(value) => onChange({ ...data, sizeMobile: value[0] })}
            min={1}
            max={4}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Font Size - Desktop */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="w-3 h-3" />
            <span>Tamanho Desktop</span>
            <span className="ml-auto font-mono">{data.sizeDesktop || 2.5}rem</span>
          </div>
          <Slider
            value={[data.sizeDesktop || 2.5]}
            onValueChange={(value) => onChange({ ...data, sizeDesktop: value[0] })}
            min={1.5}
            max={6}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bold className="w-3 h-3" />
            <span>Peso da Fonte</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {fontWeights.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={(data.fontWeight || '700') === value ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => onChange({ ...data, fontWeight: value })}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Minus className="w-3 h-3" />
            <span>Espaçamento entre Letras</span>
            <span className="ml-auto font-mono">{data.letterSpacing || 0}em</span>
          </div>
          <Slider
            value={[data.letterSpacing || 0]}
            onValueChange={(value) => onChange({ ...data, letterSpacing: value[0] })}
            min={-0.1}
            max={0.3}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>

      {/* Colors Section */}
      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
        <Label className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
          <Palette className="w-3 h-3" />
          Cores
        </Label>

        {/* Text Color */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Cor do Texto</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.color || '#ffffff'}
              onChange={(e) => onChange({ ...data, color: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0"
            />
            {data.color && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onChange({ ...data, color: '' })}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Tag Color (if enabled) */}
        {data.showTag && (
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Cor da Tag</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.tagColor || '#22c55e'}
                onChange={(e) => onChange({ ...data, tagColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Decoration */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Decoração</Label>
        <div className="grid grid-cols-2 gap-1">
          {decorations.map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              variant={(data.decoration || 'none') === value ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8"
              onClick={() => onChange({ ...data, decoration: value })}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Uppercase Toggle */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-xs text-muted-foreground">TEXTO EM MAIÚSCULAS</Label>
        <Switch
          checked={data.uppercase ?? false}
          onCheckedChange={(checked) => onChange({ ...data, uppercase: checked })}
        />
      </div>

      {/* Max Width */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Largura Máxima</span>
          <span className="ml-auto font-mono">{data.maxWidth || 100}%</span>
        </div>
        <Slider
          value={[data.maxWidth || 100]}
          onValueChange={(value) => onChange({ ...data, maxWidth: value[0] })}
          min={50}
          max={100}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default HeadlineSectionEditor;
