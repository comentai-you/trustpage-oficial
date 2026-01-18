import { useState } from "react";
import { Play, ShoppingBag, Sparkles, LinkIcon, Magnet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { TemplateType } from "@/types/landing-page";
import { useIsMobile } from "@/hooks/use-mobile";

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (templateType: TemplateType) => void;
  isFreePlan?: boolean;
}

const TemplateSelectionModal = ({ open, onOpenChange, onSelect }: TemplateSelectionModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const isMobile = useIsMobile();

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  const TemplateContent = () => (
    <>
      <div className="grid grid-cols-1 gap-3">
        {/* Bio Link Template */}
        <button
          onClick={() => setSelectedTemplate("bio")}
          className={`group relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
            selectedTemplate === "bio"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${
                selectedTemplate === "bio"
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <LinkIcon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground mb-1">Bio Link Pro</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Reúna todos os seus links em uma única página profissional.
              </p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                  Multi Links
                </span>
              </div>
            </div>
          </div>

          {selectedTemplate === "bio" && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* Capture Hero Template */}
        <button
          onClick={() => setSelectedTemplate("capture-hero")}
          className={`group relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
            selectedTemplate === "capture-hero"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${
                selectedTemplate === "capture-hero"
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Magnet className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground mb-1">Página de Captura Hero</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Visual premium com destaque para E-books, Iscas e Lançamentos.
              </p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                  Alta Conversão
                </span>
                <span className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                  Lead Magnet
                </span>
              </div>
            </div>
          </div>

          {selectedTemplate === "capture-hero" && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* VSL Template */}
        <button
          onClick={() => setSelectedTemplate("vsl")}
          className={`group relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
            selectedTemplate === "vsl"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${
                selectedTemplate === "vsl"
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Play className="w-5 h-5" fill={selectedTemplate === "vsl" ? "white" : "currentColor"} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground mb-1">VSL Focada</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Ideal para PLR e Infoprodutos. Foco total no vídeo de vendas.
              </p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                  Vídeo Central
                </span>
                <span className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                  Timer CTA
                </span>
              </div>
            </div>
          </div>

          {selectedTemplate === "vsl" && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* Sales Page Template */}
        <button
          onClick={() => setSelectedTemplate("sales")}
          className={`group relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
            selectedTemplate === "sales"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${
                selectedTemplate === "sales"
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground mb-1">Página de Vendas</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Layout completo com vídeo, carrossel e múltiplos CTAs.
              </p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                  Carrossel
                </span>
                <span className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                  Multi CTA
                </span>
              </div>
            </div>
          </div>

          {selectedTemplate === "sales" && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            onOpenChange(false);
            setSelectedTemplate(null);
          }}
        >
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleSelect} disabled={!selectedTemplate}>
          Continuar
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6 max-h-[90vh]">
          <DrawerHeader className="px-0 pt-4 pb-2">
            <DrawerTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Escolha o Tipo de Página
            </DrawerTitle>
            <DrawerDescription className="text-sm">
              Selecione o template ideal para seu produto
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <TemplateContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Escolha o Tipo de Página
          </DialogTitle>
          <DialogDescription>
            Selecione o template ideal para o seu produto ou serviço
          </DialogDescription>
        </DialogHeader>
        <TemplateContent />
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionModal;
