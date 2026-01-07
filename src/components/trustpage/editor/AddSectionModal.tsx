import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Layout, FileText, Image, Columns, Video, CheckSquare, 
  HelpCircle, MessageSquare, MousePointerClick, Maximize2,
  LucideIcon
} from "lucide-react";
import { SectionType, sectionCatalog, SectionCatalogItem } from "@/types/section-builder";

const ICON_MAP: Record<string, LucideIcon> = {
  Layout,
  FileText,
  Image,
  Columns,
  Video,
  CheckSquare,
  HelpCircle,
  MessageSquare,
  MousePointerClick,
  Maximize2
};

interface AddSectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: SectionType) => void;
}

const categoryLabels: Record<string, string> = {
  'content': 'Conteúdo',
  'media': 'Mídia',
  'social-proof': 'Prova Social',
  'conversion': 'Conversão'
};

const AddSectionModal = ({ open, onClose, onSelect }: AddSectionModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(sectionCatalog.map(s => s.category)));

  const filteredSections = selectedCategory 
    ? sectionCatalog.filter(s => s.category === selectedCategory)
    : sectionCatalog;

  const handleSelect = (type: SectionType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Adicionar Nova Seção</DialogTitle>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-4">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {categoryLabels[cat] || cat}
            </Button>
          ))}
        </div>

        {/* Section Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredSections.map((section) => {
            const IconComponent = ICON_MAP[section.icon] || Layout;
            return (
              <button
                key={section.type}
                onClick={() => handleSelect(section.type)}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {section.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSectionModal;
