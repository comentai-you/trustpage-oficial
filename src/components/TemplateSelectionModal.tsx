import { useState } from "react";
import { Play, ShoppingBag, Sparkles, LinkIcon, Magnet, Copy, Lock, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateType } from "@/types/landing-page";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import UpgradeModal from "./UpgradeModal";

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (templateType: TemplateType) => void;
  isFreePlan?: boolean;
}

interface TemplateOptionProps {
  id: TemplateType;
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateOption = ({ icon, title, description, tags, isSelected, onSelect }: TemplateOptionProps) => (
  <button
    onClick={onSelect}
    className={`group relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
      isSelected
        ? "border-primary bg-primary/5 shadow-md"
        : "border-border hover:border-primary/50"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${
          isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary group-hover:bg-primary/20"
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-semibold text-foreground mb-0.5">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
          {tags.map((tag) => (
            <span key={tag} className="px-1.5 sm:px-2 py-0.5 bg-secondary/50 text-[10px] sm:text-xs rounded-full text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>

    {isSelected && (
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )}
  </button>
);

const TemplateSelectionModal = ({ open, onOpenChange, onSelect, isFreePlan = false }: TemplateSelectionModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  const handleClonerClick = () => {
    if (isFreePlan) {
      setShowUpgradeModal(true);
    } else {
      onOpenChange(false);
      navigate("/clonador");
    }
  };

  const templates = [
    {
      id: "bio" as TemplateType,
      icon: <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Bio Link Pro",
      description: "Reúna todos os seus links em uma única página profissional.",
      tags: ["Multi Links"],
    },
    {
      id: "capture-hero" as TemplateType,
      icon: <Magnet className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Página de Captura",
      description: "Visual premium para E-books, Iscas e Lançamentos.",
      tags: ["Alta Conversão", "Lead Magnet"],
    },
    {
      id: "vsl" as TemplateType,
      icon: <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />,
      title: "VSL Focada",
      description: "Ideal para PLR e Infoprodutos. Foco total no vídeo.",
      tags: ["Vídeo Central", "Timer CTA"],
    },
    {
      id: "sales" as TemplateType,
      icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Página de Vendas",
      description: "Layout completo com vídeo, carrossel e múltiplos CTAs.",
      tags: ["Carrossel", "Multi CTA"],
    },
  ];

  const TemplatesList = () => (
    <div className="grid grid-cols-1 gap-2 sm:gap-3 pb-2">
      {templates.map((template) => (
        <TemplateOption
          key={template.id}
          {...template}
          isSelected={selectedTemplate === template.id}
          onSelect={() => setSelectedTemplate(template.id)}
        />
      ))}

      {/* Divider */}
      <div className="relative py-1.5 sm:py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 sm:px-3 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
            Ferramenta Avançada
          </span>
        </div>
      </div>

      {/* Page Cloner - Premium Feature */}
      <button
        onClick={handleClonerClick}
        className={`group relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
          isFreePlan 
            ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/50"
            : "border-border hover:border-primary/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${
              isFreePlan
                ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                : "bg-primary/10 text-primary group-hover:bg-primary/20"
            }`}
          >
            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Clonador de Páginas</h3>
              {isFreePlan && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full uppercase">
                  <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Pro
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              Clone qualquer página de vendas e substitua links.
            </p>

            <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
              <span className="px-1.5 sm:px-2 py-0.5 bg-secondary/50 text-[10px] sm:text-xs rounded-full text-secondary-foreground">
                Import URL
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 bg-secondary/50 text-[10px] sm:text-xs rounded-full text-secondary-foreground">
                Link Swapper
              </span>
            </div>
          </div>
        </div>

        {isFreePlan && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
          </div>
        )}
      </button>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex gap-2 sm:gap-3 pt-3 border-t border-border bg-background">
      <Button
        variant="outline"
        className="flex-1 h-9 sm:h-10 text-sm"
        onClick={() => {
          onOpenChange(false);
          setSelectedTemplate(null);
        }}
      >
        Cancelar
      </Button>
      <Button 
        className="flex-1 h-9 sm:h-10 text-sm" 
        onClick={handleSelect} 
        disabled={!selectedTemplate}
      >
        Continuar
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[85vh] flex flex-col">
            <DrawerHeader className="px-4 pt-4 pb-2 flex-shrink-0">
              <DrawerTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-primary" />
                Escolha o Tipo de Página
              </DrawerTitle>
              <DrawerDescription className="text-xs">
                Selecione o template ideal para seu produto
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden px-4">
              <ScrollArea className="h-[50vh]">
                <TemplatesList />
              </ScrollArea>
            </div>
            <div className="px-4 pb-4 flex-shrink-0">
              <ActionButtons />
            </div>
          </DrawerContent>
        </Drawer>

        <UpgradeModal 
          open={showUpgradeModal} 
          onOpenChange={setShowUpgradeModal} 
          feature="cloner" 
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Escolha o Tipo de Página
            </DialogTitle>
            <DialogDescription>
              Selecione o template ideal para o seu produto
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-5">
            <ScrollArea className="h-[45vh]">
              <TemplatesList />
            </ScrollArea>
          </div>
          <div className="px-5 pb-5 flex-shrink-0">
            <ActionButtons />
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        feature="cloner" 
      />
    </>
  );
};

export default TemplateSelectionModal;
