import { useCallback, useEffect, useRef, useState } from "react";
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
  Wand2,
  Loader2,
  RefreshCw,
  Crown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAICopywriter } from "@/contexts/AICopywriterContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const { settings, isConfigured } = useAICopywriter();
  const { user } = useAuth();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  
  // AI state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOptions, setAiOptions] = useState<string[]>([]);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showConfigWarning, setShowConfigWarning] = useState(false);

  // Check if user is PRO
  useEffect(() => {
    const checkPlan = async () => {
      if (!user) {
        setIsPro(false);
        return;
      }
      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();
      setIsPro(profileData?.plan_type === 'pro' || profileData?.plan_type === 'elite');
    };
    checkPlan();
  }, [user]);

  const handleAIGenerate = async () => {
    setAiLoading(true);
    setAiOptions([]);
    setShowUpgrade(false);
    setShowConfigWarning(false);

    try {
      const { data: aiData, error } = await supabase.functions.invoke('generate-copy', {
        body: {
          niche: settings.niche,
          pageType: settings.pageType,
          fieldType: 'richtext',
          currentText: data.content?.replace(/<[^>]*>/g, ' ').substring(0, 200) || ''
        }
      });

      if (error) throw error;

      if (aiData?.options && Array.isArray(aiData.options)) {
        setAiOptions(aiData.options);
      } else {
        throw new Error('Resposta inválida da IA');
      }
    } catch (error) {
      console.error('Error generating copy:', error);
      toast.error('Erro ao gerar sugestões');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIClick = () => {
    if (!user) {
      toast.error('Faça login para usar a IA Copywriter');
      return;
    }
    setAiOpen(true);
    setAiOptions([]);
    setShowUpgrade(false);
    setShowConfigWarning(false);

    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    if (!isConfigured) {
      setShowConfigWarning(true);
      return;
    }
    handleAIGenerate();
  };

  const handleSelectOption = (option: string) => {
    // Convert to HTML paragraphs
    const htmlContent = option.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
    onChange({ ...data, content: htmlContent });
    setAiOpen(false);
    toast.success('Texto aplicado!');
  };

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

      // Use data attribute instead of inline style - color only shows in preview
      const span = document.createElement("span");
      span.setAttribute("data-accent-color", color);

      try {
        range.surroundContents(span);
      } catch {
        const extracted = range.extractContents();
        span.appendChild(extracted);
        range.insertNode(span);
      }

      // Move cursor after span
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

          <div className="w-px h-6 bg-border self-center mx-1" />

          {/* AI Magic Button */}
          <Popover open={aiOpen} onOpenChange={setAiOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                title={isPro ? 'Gerar texto com IA' : 'Recurso PRO'}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAIClick();
                }}
              >
                {isPro === false ? (
                  <Crown className="w-4 h-4 text-amber-500" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={4}>
              {/* Upgrade CTA for Free users */}
              {showUpgrade && (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-6 h-6 text-amber-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Funcionalidade Exclusiva PRO
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Faça upgrade para desbloquear a IA Copywriter.
                  </p>
                  <Button 
                    onClick={() => { setAiOpen(false); navigate('/oferta'); }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    Ver Planos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Config Warning */}
              {showConfigWarning && !showUpgrade && (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Configure a IA primeiro
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Clique no botão <strong>"Cérebro IA"</strong> na barra lateral.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setAiOpen(false)}
                    className="w-full"
                  >
                    Entendi
                  </Button>
                </div>
              )}

              {/* Normal flow for PRO + Configured */}
              {!showUpgrade && !showConfigWarning && (
                <>
                  <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-800">
                      <Sparkles className="w-4 h-4" />
                      Sugestões de Texto Livre
                    </div>
                    <p className="text-xs text-purple-600 mt-0.5">
                      Nicho: {settings.niche}
                    </p>
                  </div>

                  <div className="p-2">
                    {aiLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                        <span className="ml-2 text-sm text-gray-500">Gerando sugestões...</span>
                      </div>
                    ) : aiOptions.length > 0 ? (
                      <div className="space-y-1.5">
                        {aiOptions.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectOption(option)}
                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                          >
                            <span className="text-sm text-gray-700 group-hover:text-purple-800 line-clamp-3">
                              {option}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-sm text-gray-500">
                        Gerando opções...
                      </div>
                    )}
                  </div>

                  {aiOptions.length > 0 && (
                    <div className="p-2 border-t bg-gray-50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAIGenerate}
                        disabled={aiLoading}
                        className="w-full text-xs text-purple-600 hover:text-purple-800"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
                        Tentar Novamente
                      </Button>
                    </div>
                  )}
                </>
              )}
            </PopoverContent>
          </Popover>
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
