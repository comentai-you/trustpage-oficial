import { useState, useRef, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TextSection } from "@/types/section-builder";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  PanelTop,
  PanelBottom,
  Palette
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TextSectionEditorProps {
  data: TextSection['data'];
  onChange: (data: TextSection['data']) => void;
  accentColor?: string;
}

// Preset colors for quick selection
const PRESET_COLORS = [
  '#FFFFFF', '#F8F9FA', '#E9ECEF', '#6B7280', '#374151', '#1F2937', '#111827', '#000000',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
];

const TextSectionEditor = ({ data, onChange, accentColor = '#22c55e' }: TextSectionEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [accentColorOpen, setAccentColorOpen] = useState(false);

  // Sync content when data changes from outside
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== data.content) {
      editorRef.current.innerHTML = data.content || '<p>Escreva seu texto aqui...</p>';
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    // Update after a small delay to capture the change
    setTimeout(() => {
      if (editorRef.current) {
        onChange({ ...data, content: editorRef.current.innerHTML });
      }
    }, 10);
  }, [data, onChange]);

  const updateContent = useCallback(() => {
    if (editorRef.current) {
      onChange({ ...data, content: editorRef.current.innerHTML });
    }
  }, [data, onChange]);

  const insertHeading = (level: 1 | 2 | 3 | 4) => {
    execCommand('formatBlock', `h${level}`);
  };

  const applyAccentColor = () => {
    const color = data.accentColor || accentColor;
    execCommand('foreColor', color);
  };

  const applyTextColor = (color: string) => {
    execCommand('foreColor', color);
    setTextColorOpen(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateContent();
  };

  const textColor = data.textColor || '#FFFFFF';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Formatação</Label>
        <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-lg border">
          {/* Headings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs gap-1"
              >
                <Heading1 className="w-4 h-4" />
                Título
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-50">
              <DropdownMenuItem onClick={() => insertHeading(1)} className="gap-2">
                <Heading1 className="w-4 h-4" /> Título 1 (H1)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertHeading(2)} className="gap-2">
                <Heading2 className="w-4 h-4" /> Título 2 (H2)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertHeading(3)} className="gap-2">
                <Heading3 className="w-4 h-4" /> Título 3 (H3)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertHeading(4)} className="gap-2">
                <Heading4 className="w-4 h-4" /> Título 4 (H4)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => execCommand('formatBlock', 'p')} className="gap-2">
                Parágrafo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-border self-center" />

          {/* Basic Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-8 w-8 p-0"
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-8 w-8 p-0"
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('underline')}
            className="h-8 w-8 p-0"
            title="Sublinhado"
          >
            <Underline className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border self-center" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            className="h-8 w-8 p-0"
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            className="h-8 w-8 p-0"
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border self-center" />

          {/* Text Color */}
          <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative"
                title="Cor do texto"
              >
                <Palette className="w-4 h-4" />
                <div 
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full"
                  style={{ backgroundColor: textColor }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 z-50" align="start">
              <div className="grid grid-cols-8 gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => applyTextColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Accent Color */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={applyAccentColor}
            className="h-8 w-8 p-0"
            title="Aplicar cor de destaque"
            style={{ color: data.accentColor || accentColor }}
          >
            <Highlighter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Conteúdo</Label>
        <div
          ref={editorRef}
          contentEditable
          onInput={updateContent}
          onPaste={handlePaste}
          className="min-h-[200px] max-h-[300px] overflow-y-auto p-3 border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          dangerouslySetInnerHTML={{ __html: data.content || '<p>Escreva seu texto aqui...</p>' }}
          style={{
            lineHeight: '1.7'
          }}
          suppressContentEditableWarning
        />
        <p className="text-[10px] text-muted-foreground">
          Selecione o texto e use os botões acima para formatar
        </p>
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <div className="flex items-center gap-1">
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
          <Button
            type="button"
            variant={data.alignment === 'justify' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ ...data, alignment: 'justify' })}
            className="h-8 w-8 p-0"
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Layout Options */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-xs text-muted-foreground font-medium">Layout do Container</Label>
        
        {/* Width */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Largura do Texto</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={data.maxWidth === 'narrow' || !data.maxWidth ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ ...data, maxWidth: 'narrow' })}
              className="h-9 text-xs gap-2"
            >
              <PanelTop className="w-4 h-4" />
              Estreito
            </Button>
            <Button
              type="button"
              variant={data.maxWidth === 'wide' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ ...data, maxWidth: 'wide' })}
              className="h-9 text-xs gap-2"
            >
              <PanelBottom className="w-4 h-4" />
              Largo
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Estreito é melhor para leitura longa
          </p>
        </div>

        {/* Background */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-xs">Fundo Destacado</Label>
            <p className="text-[10px] text-muted-foreground">
              Adiciona um card de fundo
            </p>
          </div>
          <Switch
            checked={data.hasBackground || false}
            onCheckedChange={(checked) => onChange({ ...data, hasBackground: checked })}
          />
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-xs text-muted-foreground">Cor de Destaque</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={data.accentColor || accentColor}
            onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
            className="w-12 h-8 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={data.accentColor || accentColor}
            onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
            placeholder="#22c55e"
            className="flex-1 text-xs h-8"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Use o marcador (✏️) para aplicar essa cor em palavras específicas
        </p>
      </div>
    </div>
  );
};

export default TextSectionEditor;