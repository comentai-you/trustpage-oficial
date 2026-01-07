import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { 
  GripVertical, Trash2, ChevronDown, ChevronUp,
  Layout, FileText, Image, Columns, Video, CheckSquare, 
  HelpCircle, MessageSquare, MousePointerClick, Maximize2,
  LucideIcon
} from "lucide-react";
import { ContentSection, SectionType } from "@/types/section-builder";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const ICON_MAP: Record<SectionType, LucideIcon> = {
  'hero': Layout,
  'text': FileText,
  'full-image': Image,
  'dual-column': Columns,
  'video-grid': Video,
  'benefits': CheckSquare,
  'faq': HelpCircle,
  'testimonials': MessageSquare,
  'cta': MousePointerClick,
  'spacer': Maximize2
};

const TYPE_LABELS: Record<SectionType, string> = {
  'hero': 'Hero Section',
  'text': 'Texto Livre',
  'full-image': 'Imagem Full Width',
  'dual-column': 'Coluna Dupla',
  'video-grid': 'Grid de Vídeos',
  'benefits': 'Lista de Benefícios',
  'faq': 'FAQ',
  'testimonials': 'Depoimentos',
  'cta': 'Botão CTA',
  'spacer': 'Espaçador'
};

interface SortableSectionItemProps {
  section: ContentSection;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SortableSectionItem = ({ 
  section, 
  onDelete, 
  onUpdate,
  children,
  defaultOpen = false 
}: SortableSectionItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = ICON_MAP[section.type];

  const getSectionPreview = (): string => {
    switch (section.type) {
      case 'hero':
        return section.data.headline?.substring(0, 40) + (section.data.headline?.length > 40 ? '...' : '') || 'Hero Section';
      case 'text':
        return section.data.content?.substring(0, 40) + (section.data.content?.length > 40 ? '...' : '') || 'Texto';
      case 'benefits':
        return `${section.data.items?.length || 0} benefícios`;
      case 'faq':
        return `${section.data.items?.length || 0} perguntas`;
      case 'testimonials':
        return `${section.data.items?.length || 0} depoimentos`;
      case 'cta':
        return section.data.text || 'CTA';
      case 'dual-column':
        return section.data.title || 'Coluna Dupla';
      case 'video-grid':
        return `${section.data.videos?.length || 0} vídeos`;
      default:
        return TYPE_LABELS[section.type];
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-border rounded-lg bg-card overflow-hidden transition-shadow ${
        isDragging ? 'shadow-lg opacity-80 z-50' : ''
      }`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header */}
        <div className="flex items-center gap-2 p-3 bg-muted/30">
          {/* Drag handle */}
          <button
            className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Icon */}
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-4 h-4 text-primary" />
          </div>

          {/* Title & Preview */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {TYPE_LABELS[section.type]}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {getSectionPreview()}
            </p>
          </div>

          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(section.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Content */}
        <CollapsibleContent>
          <div className="p-4 border-t border-border">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SortableSectionItem;
