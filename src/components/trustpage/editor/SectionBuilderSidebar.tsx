import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Settings, Palette, RefreshCw } from "lucide-react";
import { AIConfigDialog } from "@/components/ai/AIConfigDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LandingPageFormData } from "@/types/landing-page";
import { 
  ContentSection, 
  SectionType, 
  SectionBuilderContent,
  createDefaultSection,
  migrateToSectionBuilder
} from "@/types/section-builder";
import SortableSectionItem from "./SortableSectionItem";
import AddSectionModal from "./AddSectionModal";
import ThemeSelector, { salesThemes, SalesTheme } from "./ThemeSelector";
import CoverImageUpload from "./CoverImageUpload";

// Section editors
import HeroSectionEditor from "./sections/HeroSectionEditor";
import TextSectionEditor from "./sections/TextSectionEditor";
import FullImageSectionEditor from "./sections/FullImageSectionEditor";
import DualColumnSectionEditor from "./sections/DualColumnSectionEditor";
import BenefitsSectionEditor from "./sections/BenefitsSectionEditor";
import FAQSectionEditor from "./sections/FAQSectionEditor";
import { CTASectionEditor } from "./sections/CTASectionEditor";
import TestimonialsSectionEditor from "./sections/TestimonialsSectionEditor";
import VideoGridSectionEditor from "./sections/VideoGridSectionEditor";
import OfferSectionEditor from "./sections/OfferSectionEditor";

interface SectionBuilderSidebarProps {
  formData: LandingPageFormData;
  onChange: (data: Partial<LandingPageFormData>) => void;
  userPlan?: string;
}

const SectionBuilderSidebar = ({ formData, onChange, userPlan = 'free' }: SectionBuilderSidebarProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Check if content is legacy format or new SectionBuilder format
  const contentData = formData.content as unknown;
  const isLegacyFormat = contentData && typeof contentData === 'object' && 
    !('sections' in (contentData as object)) && 
    ('benefits' in (contentData as object) || 'testimonials' in (contentData as object));
  
  // Parse sections from content
  const builderContent = (formData.content as unknown as SectionBuilderContent) || { sections: [] };
  const sections = isLegacyFormat ? [] : (builderContent.sections || []);
  
  // Handle migration from legacy to section builder
  const handleMigrateLegacy = () => {
    const legacyContent = formData.content as any;
    const migratedContent = migrateToSectionBuilder(
      legacyContent,
      formData.headline,
      formData.subheadline,
      formData.video_url,
      formData.image_url,
      formData.cta_text,
      formData.cta_url
    );
    onChange({ content: migratedContent as unknown as LandingPageFormData['content'] });
  };

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Theme handling
  const getCurrentThemeId = (): string => {
    const currentBg = formData.colors?.background?.toLowerCase() || '#09090b';
    const matchedTheme = salesThemes.find(t => t.colors.background.toLowerCase() === currentBg);
    return matchedTheme?.id || 'dark-conversion';
  };

  const handleThemeSelect = (theme: SalesTheme) => {
    onChange({
      primary_color: theme.colors.primary,
      colors: {
        ...formData.colors,
        background: theme.colors.background,
        text: theme.colors.text,
        buttonBg: theme.colors.primary,
        buttonText: '#ffffff'
      }
    });
  };

  // Update sections in formData
  const updateSections = (newSections: ContentSection[]) => {
    onChange({
      content: {
        ...builderContent,
        sections: newSections.map((s, i) => ({ ...s, order: i }))
      } as unknown as LandingPageFormData['content']
    });
  };

  // Add new section
  const handleAddSection = (type: SectionType) => {
    const newSection = createDefaultSection(type, sections.length);
    updateSections([...sections, newSection]);
    setShowAddModal(false);
  };

  // Delete section
  const handleDeleteSection = (id: string) => {
    updateSections(sections.filter(s => s.id !== id));
  };

  // Update section data
  const handleUpdateSection = (id: string, data: any) => {
    updateSections(
      sections.map(s => s.id === id ? { ...s, data } : s)
    );
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      updateSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  // Render section editor based on type
  const renderSectionEditor = (section: ContentSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <HeroSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'text':
        return (
          <TextSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'full-image':
        return (
          <FullImageSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'dual-column':
        return (
          <DualColumnSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'benefits':
        return (
          <BenefitsSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'faq':
        return (
          <FAQSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'cta':
        return (
          <CTASectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'video-grid':
        return (
          <VideoGridSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'offer':
        return (
          <OfferSectionEditor
            data={section.data}
            onChange={(data) => handleUpdateSection(section.id, data)}
          />
        );
      case 'spacer':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Altura do Espaço</Label>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg', 'xl'] as const).map((height) => (
                <Button
                  key={height}
                  type="button"
                  variant={section.data.height === height ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateSection(section.id, { height })}
                >
                  {height === 'sm' && 'P'}
                  {height === 'md' && 'M'}
                  {height === 'lg' && 'G'}
                  {height === 'xl' && 'XG'}
                </Button>
              ))}
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">Editor não disponível</p>;
    }
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Section Builder</h2>
            <p className="text-sm text-gray-500">Arraste para reordenar</p>
          </div>
          <AIConfigDialog />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["appearance", "sections"]} className="w-full">
        {/* Settings - Cover Image */}
        <AccordionItem value="settings">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Settings className="w-4 h-4 text-primary" />
              Configurações
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Nome da Página</Label>
              <Input
                value={formData.page_name}
                onChange={(e) => onChange({ page_name: e.target.value })}
                placeholder="Minha Página de Vendas"
                className="text-sm"
              />
            </div>
            <CoverImageUpload 
              coverImageUrl={formData.cover_image_url || ''} 
              onChange={(url) => onChange({ cover_image_url: url })} 
            />
          </AccordionContent>
        </AccordionItem>

        {/* Appearance */}
        <AccordionItem value="appearance">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4 text-primary" />
              Aparência
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Tema Profissional</Label>
              <ThemeSelector
                selectedThemeId={getCurrentThemeId()}
                onSelectTheme={handleThemeSelect}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sections */}
        <AccordionItem value="sections" className="border-b-0">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4 text-primary" />
              Seções ({sections.length})
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {/* Add Section Button */}
            <Button
              variant="outline"
              className="w-full mb-4 border-dashed border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Seção
            </Button>

            {/* Sortable Section List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      onDelete={handleDeleteSection}
                      onUpdate={handleUpdateSection}
                      defaultOpen={index === 0}
                    >
                      {renderSectionEditor(section)}
                    </SortableSectionItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {sections.length === 0 && !isLegacyFormat && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhuma seção adicionada</p>
                <p className="text-xs mt-1">Clique em "Adicionar Seção" para começar</p>
              </div>
            )}

            {isLegacyFormat && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Esta página usa o formato antigo
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  Migre para o novo Section Builder para editar seções individualmente.
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleMigrateLegacy}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Migrar para Section Builder
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Add Section Modal */}
      <AddSectionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={handleAddSection}
      />
    </aside>
  );
};

export default SectionBuilderSidebar;
