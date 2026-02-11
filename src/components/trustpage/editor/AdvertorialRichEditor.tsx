import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
  Minus,
} from 'lucide-react';

interface AdvertorialRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

const AdvertorialRichEditor = ({ value, onChange, className }: AdvertorialRichEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-3 py-2 text-sm',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && !editor.isFocused) {
      const currentHtml = editor.getHTML();
      if (currentHtml !== value) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL do link:');
    if (url) {
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      editor.chain().focus().setLink({ href: finalUrl }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn('h-7 w-7 p-0', active && 'bg-muted text-foreground')}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn('bg-background', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1 bg-muted/30">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="H4">
          <Heading4 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} active={editor.isActive('heading', { level: 5 })} title="H5">
          <Heading5 className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista Numerada">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Link">
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-5 bg-border mx-0.5" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer">
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default AdvertorialRichEditor;
