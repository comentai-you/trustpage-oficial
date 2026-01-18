import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { Node, mergeAttributes } from "@tiptap/core";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Type,
  Heading1,
  Heading2,
  Quote,
  Sparkles,
  Loader2,
  MousePointer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MarketingEmailEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Custom CTA Button Extension
const CTAButton = Node.create({
  name: "ctaButton",
  group: "block",
  content: "text*",
  atom: false,
  draggable: true,

  addAttributes() {
    return {
      href: {
        default: "#",
      },
      buttonColor: {
        default: "#8B5CF6",
      },
      textColor: {
        default: "#FFFFFF",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="cta-button"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-type": "cta-button",
        href: node.attrs.href,
        style: `
          display: inline-block;
          padding: 14px 32px;
          background-color: ${node.attrs.buttonColor};
          color: ${node.attrs.textColor};
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          margin: 16px 0;
        `,
      }),
      0,
    ];
  },
});

const MarketingEmailEditor = ({ value, onChange }: MarketingEmailEditorProps) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [ctaDialogOpen, setCTADialogOpen] = useState(false);
  const [ctaText, setCTAText] = useState("Clique Aqui");
  const [ctaUrl, setCTAUrl] = useState("");
  const [ctaColor, setCTAColor] = useState("#8B5CF6");
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: "color: #8B5CF6; text-decoration: underline;",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          style: "max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;",
        },
      }),
      CTAButton,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 5MB)");
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `marketing/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-content")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("blog-content")
        .getPublicUrl(fileName);

      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      toast.success("Imagem inserida!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = "";
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
  };

  const handleInsertCTA = () => {
    if (ctaUrl && ctaText) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "ctaButton",
          attrs: {
            href: ctaUrl,
            buttonColor: ctaColor,
            textColor: "#FFFFFF",
          },
          content: [{ type: "text", text: ctaText }],
        })
        .run();
    }
    setCTADialogOpen(false);
    setCTAText("Clique Aqui");
    setCTAUrl("");
  };

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        active ? "bg-gray-200 dark:bg-gray-600 text-primary" : "text-gray-600 dark:text-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Título 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Título 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Negrito"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Itálico"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Sublinhado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Lista"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Lista Numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citação"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <ToolbarButton
          onClick={() => setLinkDialogOpen(true)}
          active={editor.isActive("link")}
          title="Inserir Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => document.getElementById("image-upload-marketing")?.click()}
          disabled={isUploading}
          title="Inserir Imagem"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </ToolbarButton>

        <input
          id="image-upload-marketing"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* CTA Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCTADialogOpen(true)}
          className="gap-1"
        >
          <MousePointer className="w-4 h-4" />
          Botão CTA
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white dark:bg-gray-900" />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInsertLink}>Inserir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CTA Button Dialog */}
      <Dialog open={ctaDialogOpen} onOpenChange={setCTADialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Botão de CTA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cta-text">Texto do Botão</Label>
              <Input
                id="cta-text"
                placeholder="Clique Aqui"
                value={ctaText}
                onChange={(e) => setCTAText(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cta-url">URL de Destino</Label>
              <Input
                id="cta-url"
                placeholder="https://exemplo.com/oferta"
                value={ctaUrl}
                onChange={(e) => setCTAUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cta-color">Cor do Botão</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  id="cta-color"
                  value={ctaColor}
                  onChange={(e) => setCTAColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={ctaColor}
                  onChange={(e) => setCTAColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <a
                href="#"
                style={{
                  display: "inline-block",
                  padding: "14px 32px",
                  backgroundColor: ctaColor,
                  color: "#FFFFFF",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                {ctaText || "Clique Aqui"}
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCTADialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInsertCTA}>Inserir Botão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingEmailEditor;
