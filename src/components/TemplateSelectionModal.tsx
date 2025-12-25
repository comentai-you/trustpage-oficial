import { useState } from "react";
import { Play, ShoppingBag, ArrowRight, Sparkles, LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateType } from "@/types/landing-page";

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (templateType: TemplateType) => void;
}

const TemplateSelectionModal = ({
  open,
  onOpenChange,
  onSelect,
}: TemplateSelectionModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Escolha o Tipo de Página
          </DialogTitle>
          <DialogDescription>
            Selecione o template ideal para o seu produto ou serviço
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* VSL Template */}
          <button
            onClick={() => setSelectedTemplate('vsl')}
            className={`group relative p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
              selectedTemplate === 'vsl'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
              selectedTemplate === 'vsl' 
                ? 'bg-primary text-white' 
                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
            }`}>
              <Play className="w-7 h-7" fill={selectedTemplate === 'vsl' ? 'white' : 'currentColor'} />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              VSL Focada
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ideal para <span className="font-medium text-foreground">PLR e Infoprodutos</span>. 
              Foco total no vídeo de vendas com CTA controlado por tempo.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Vídeo Central
              </span>
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Timer CTA
              </span>
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Alta Conversão
              </span>
            </div>

            {selectedTemplate === 'vsl' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Sales Page Template */}
          <button
            onClick={() => setSelectedTemplate('sales')}
            className={`group relative p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
              selectedTemplate === 'sales'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
              selectedTemplate === 'sales' 
                ? 'bg-primary text-white' 
                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
            }`}>
              <ShoppingBag className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Página de Vendas
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ideal para <span className="font-medium text-foreground">Produtos Físicos e Serviços</span>. 
              Mostre benefícios, depoimentos e oferta irresistível.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Benefícios
              </span>
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Depoimentos
              </span>
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Preço
              </span>
            </div>

            {selectedTemplate === 'sales' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Bio Link Template */}
          <button
            onClick={() => setSelectedTemplate('bio')}
            className={`group relative p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
              selectedTemplate === 'bio'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
              selectedTemplate === 'bio' 
                ? 'bg-primary text-white' 
                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
            }`}>
              <LinkIcon className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Bio Link Pro
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ideal para <span className="font-medium text-foreground">Instagram e TikTok</span>. 
              Agregador de links premium com ícones e destaques.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Redes Sociais
              </span>
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Multi-Links
              </span>
              <span className="px-2 py-1 bg-secondary/50 text-xs rounded-full text-secondary-foreground">
                Destaques
              </span>
            </div>

            {selectedTemplate === 'bio' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedTemplate}
            className="gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionModal;
