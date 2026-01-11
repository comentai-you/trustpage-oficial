import { useCallback, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TextSection } from "@/types/section-builder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Palette,
  PanelBottom,
  PanelTop,
  Redo,
  Type,
  Underline,
  Undo,
} from "lucide-react";

interface TextSectionEditorProps {
  data: TextSection["data"];
  onChange: (data: TextSection["data"]) => void;
  accentColor?: string;
}

/**
 * Texto Livre (Rich Text) - versão simples e robusta.
 * Principais objetivos:
 * - Headings (H1-H4) funcionando
 * - Negrito/itálico/sublinhado
 * - Lista
 * - Cor do texto do bloco (render/preview), sem "pintar" o editor
 * - Destaque por cor no texto selecionado (inline)
 */
const TextSectionEditor = ({ data, onChange, accentColor = "#22c55e" }: TextSectionEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const syncEditorHtml = useCallback(() => {
    if (!editorRef.current) return;

    const nextHtml = data.content || "<p></p>";
    if (editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [data.content]);

  useEffect(() => {
    syncEditorHtml();
  }, [syncEditorHtml]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const editor = editorRef.current;

    if (!editor) return;
    if (!editor.contains(range.commonAncestorContainer)) return;

    savedRangeRef.current = range.cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    const range = savedRangeRef.current;
    const sel = window.getSelection();

    if (!editor || !range || !sel) return;

    editor.focus();
    sel.removeAllRanges();
    sel.addRange(range);
  }, []);

  const updateContent = useCallback(() => {
    if (!editorRef.current) return;
    onChange({ ...data, content: editorRef.current.innerHTML });
  }, [data, onChange]);

  const runCommand = useCallback(
    (command: string, value?: string) => {
      restoreSelection();
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand(command, false, value);
      updateContent();
      saveSelection();
    },
    [restoreSelection, saveSelection, updateContent]
  );

  const applyInlineColor = useCallback(
    (color: string) => {
      restoreSelection();

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      if (range.collapsed) return;

      const span = document.createElement("span");
      span.style.color = color;

      try {
        range.surroundContents(span);
      } catch {
        const extracted = range.extractContents();
        span.appendChild(extracted);
        range.insertNode(span);
      }

      // Move o cursor para depois do span
      const after = document.createRange();
      after.setStartAfter(span);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      savedRangeRef.current = after.cloneRange();

      updateContent();
    },
    [restoreSelection, updateContent]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      restoreSelection();
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand("insertText", false, text);
      updateContent();
      saveSelection();
    },
    [restoreSelection, saveSelection, updateContent]
  );

  const ToolbarButton = ({
    title,
    onAction,
    children,
  }: {
    title: string;
    onAction: () => void;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      title={title}
      onMouseDown={(e) => {
        // Critico: impede o botão de roubar foco/seleção do editor
        e.preventDefault();
        onAction();
      }}
    >
      {children}
    </Button>
  );

  const resolvedAccentColor = data.accentColor || accentColor;
  const resolvedBlockTextColor = data.textColor || "#FFFFFF";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Formatação</Label>
        <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg border">
          {/* Headings */}
          <ToolbarButton title="Parágrafo" onAction={() => runCommand("formatBlock", "<p>")}
          >
            <Type className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Título H1" onAction={() => runCommand("formatBlock", "<h1>")}
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Título H2" onAction={() => runCommand("formatBlock", "<h2>")}
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Título H3" onAction={() => runCommand("formatBlock", "<h3>")}
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Título H4" onAction={() => runCommand("formatBlock", "<h4>")}
          >
            <Heading4 className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border self-center mx-1" />

          {/* Basic formatting */}
          <ToolbarButton title="Negrito" onAction={() => runCommand("bold")}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Itálico" onAction={() => runCommand("italic")}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Sublinhado" onAction={() => runCommand("underline")}
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border self-center mx-1" />

          {/* Lists */}
          <ToolbarButton
            title="Lista com marcadores"
            onAction={() => runCommand("insertUnorderedList")}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Lista numerada" onAction={() => runCommand("insertOrderedList")}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border self-center mx-1" />

          {/* Undo / Redo */}
          <ToolbarButton title="Desfazer (Ctrl+Z)" onAction={() => runCommand("undo")}>
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Refazer (Ctrl+Y)" onAction={() => runCommand("redo")}>
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          {/* Clear formatting */}
          <ToolbarButton
            title="Limpar formatação"
            onAction={() => runCommand("removeFormat")}
          >
            <Eraser className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border self-center mx-1" />

          {/* Inline highlight color */}
          <ToolbarButton
            title="Destacar seleção com a cor"
            onAction={() => applyInlineColor(resolvedAccentColor)}
          >
            <Highlighter className="w-4 h-4" style={{ color: resolvedAccentColor }} />
          </ToolbarButton>
          <Input
            type="color"
            value={resolvedAccentColor}
            onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
            className="w-10 h-8 p-1 cursor-pointer"
            title="Cor de destaque"
          />

          <div className="w-px h-6 bg-border self-center mx-1" />

          {/* Block text color (aplica na página/preview, não no editor) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              <div
                className="w-4 h-2 rounded"
                style={{ backgroundColor: resolvedBlockTextColor }}
              />
            </div>
            <Input
              type="color"
              value={resolvedBlockTextColor}
              onChange={(e) => onChange({ ...data, textColor: e.target.value })}
              className="w-10 h-8 p-1 cursor-pointer"
              title="Cor do texto (bloco)"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Selecione um trecho e use o marcador para destacar com cor. A paleta define a cor do bloco todo no preview.
        </p>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Conteúdo</Label>
        <div
          ref={editorRef}
          contentEditable
          onInput={() => {
            updateContent();
            saveSelection();
          }}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onPaste={handlePaste}
          className="min-h-[200px] max-h-[300px] overflow-y-auto p-3 border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          suppressContentEditableWarning
          style={{ lineHeight: "1.7" }}
        />
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={data.alignment === "left" || !data.alignment ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ ...data, alignment: "left" })}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={data.alignment === "center" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ ...data, alignment: "center" })}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={data.alignment === "right" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ ...data, alignment: "right" })}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={data.alignment === "justify" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ ...data, alignment: "justify" })}
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
              variant={data.maxWidth === "narrow" || !data.maxWidth ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...data, maxWidth: "narrow" })}
              className="h-9 text-xs gap-2"
            >
              <PanelTop className="w-4 h-4" />
              Estreito
            </Button>
            <Button
              type="button"
              variant={data.maxWidth === "wide" ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...data, maxWidth: "wide" })}
              className="h-9 text-xs gap-2"
            >
              <PanelBottom className="w-4 h-4" />
              Largo
            </Button>
          </div>
        </div>

        {/* Background */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-xs">Fundo Destacado</Label>
            <p className="text-[10px] text-muted-foreground">Adiciona um card de fundo</p>
          </div>
          <Switch
            checked={data.hasBackground || false}
            onCheckedChange={(checked) => onChange({ ...data, hasBackground: checked })}
          />
        </div>
      </div>
    </div>
  );
};

export default TextSectionEditor;
