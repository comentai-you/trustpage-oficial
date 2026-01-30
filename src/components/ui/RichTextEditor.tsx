import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';
import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Loader2,
  MousePointerClick,
  Undo,
  Redo,
  Minus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './dialog';
import { Input } from './input';
import { Label } from './label';

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [customButtonDialogOpen, setCustomButtonDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customButtonText, setCustomButtonText] = useState('');
  const [customButtonUrl, setCustomButtonUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg my-4 mx-auto',
        },
      }),
      Markdown.configure({
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Get markdown using the storage API from tiptap-markdown
      const storage = editor.storage as { markdown?: { getMarkdown: () => string } };
      const markdown = storage.markdown?.getMarkdown() || editor.getHTML();
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3 prose-headings:text-foreground prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:not-italic',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== undefined) {
      const storage = editor.storage as { markdown?: { getMarkdown: () => string } };
      const currentMarkdown = storage.markdown?.getMarkdown() || '';
      if (currentMarkdown !== value && !editor.isFocused) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('blog-content')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl && editor) {
        editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
        toast.success('Imagem inserida!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleImageUpload]);

  const handleInsertLink = useCallback(() => {
    if (!linkUrl || !editor) return;
    
    // Validate URL
    let url = linkUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    editor.chain().focus().setLink({ href: url }).run();
    setLinkUrl('');
    setLinkDialogOpen(false);
  }, [editor, linkUrl]);

  const handleInsertYoutube = useCallback(() => {
    if (!youtubeUrl || !editor) return;
    
    editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
    setYoutubeUrl('');
    setYoutubeDialogOpen(false);
  }, [editor, youtubeUrl]);

  const handleInsertCustomButton = useCallback(() => {
    if (!customButtonText || !customButtonUrl || !editor) return;
    
    let url = customButtonUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Insert a styled button as HTML
    const buttonHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="custom-cta-button" style="display: inline-block; background: linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 29%)); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">${customButtonText}</a>`;
    
    editor.chain().focus().insertContent(buttonHtml).run();
    setCustomButtonText('');
    setCustomButtonUrl('');
    setCustomButtonDialogOpen(false);
  }, [editor, customButtonText, customButtonUrl]);

  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-[400px] border rounded-md bg-muted/50">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('border rounded-md bg-background overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
        {/* Undo/Redo */}
        <div className="flex gap-0.5 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Desfazer"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Refazer"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Título 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Título 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            active={editor.isActive('heading', { level: 4 })}
            title="Título 4"
          >
            <Heading4 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
            active={editor.isActive('heading', { level: 5 })}
            title="Título 5"
          >
            <Heading5 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
            active={editor.isActive('heading', { level: 6 })}
            title="Título 6"
          >
            <Heading6 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text formatting */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Sublinhado"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Lista com Bullets"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Blockquote & Horizontal Rule */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Citação"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Linha Horizontal"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <ToolbarButton
          onClick={() => {
            if (editor.isActive('link')) {
              handleRemoveLink();
            } else {
              setLinkDialogOpen(true);
            }
          }}
          active={editor.isActive('link')}
          title={editor.isActive('link') ? 'Remover Link' : 'Inserir Link'}
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Inserir Imagem"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </ToolbarButton>

        {/* YouTube */}
        <ToolbarButton
          onClick={() => setYoutubeDialogOpen(true)}
          title="Inserir Vídeo do YouTube"
        >
          <YoutubeIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Custom Button */}
        <ToolbarButton
          onClick={() => setCustomButtonDialogOpen(true)}
          title="Inserir Botão Personalizado"
        >
          <MousePointerClick className="w-4 h-4" />
        </ToolbarButton>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>


      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-b-md"
      />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inserir Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL do Link</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInsertLink} disabled={!linkUrl}>
              Inserir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inserir Vídeo do YouTube</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">URL do Vídeo</Label>
              <Input
                id="youtube-url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertYoutube();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Cole o link completo do vídeo do YouTube
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInsertYoutube} disabled={!youtubeUrl}>
              Inserir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Button Dialog */}
      <Dialog open={customButtonDialogOpen} onOpenChange={setCustomButtonDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inserir Botão Personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="button-text">Texto do Botão</Label>
              <Input
                id="button-text"
                value={customButtonText}
                onChange={(e) => setCustomButtonText(e.target.value)}
                placeholder="Ex: Comece Agora"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-url">URL do Botão</Label>
              <Input
                id="button-url"
                value={customButtonUrl}
                onChange={(e) => setCustomButtonUrl(e.target.value)}
                placeholder="https://exemplo.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertCustomButton();
                  }
                }}
              />
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2">Pré-visualização:</p>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="inline-block bg-gradient-to-br from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {customButtonText || 'Texto do Botão'}
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomButtonDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInsertCustomButton} disabled={!customButtonText || !customButtonUrl}>
              Inserir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton = ({ onClick, active, disabled, title, children }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      active && 'bg-accent text-accent-foreground'
    )}
  >
    {children}
  </button>
);

export default RichTextEditor;
