import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Crown, Rocket, FileText, Users } from "lucide-react";

const STORAGE_KEY = "trustpage_update_v1_views";
const MAX_VIEWS = 3;

interface SystemUpdateModalProps {
  isOnboardingComplete: boolean;
  isOnboardingModalOpen: boolean;
}

export function SystemUpdateModal({ 
  isOnboardingComplete, 
  isOnboardingModalOpen 
}: SystemUpdateModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show if onboarding is complete and onboarding modal is not open
    if (!isOnboardingComplete || isOnboardingModalOpen) {
      return;
    }

    // Check localStorage for view count
    const viewCount = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    
    if (viewCount < MAX_VIEWS) {
      // Small delay to ensure smooth UX after page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOnboardingComplete, isOnboardingModalOpen]);

  const handleClose = () => {
    // Increment view count in localStorage
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    localStorage.setItem(STORAGE_KEY, String(currentCount + 1));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">
            🚀 Novidades na TrustPage!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confira as últimas atualizações do sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Plano Free Turbinado</p>
              <p className="text-sm text-muted-foreground">
                Acesso a <strong>TODOS os templates</strong> (VSL e Landing Pages) com limite de 1.000 visualizações/mês para validar sua oferta.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <Crown className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Plano Essencial Aprimorado</p>
              <p className="text-sm text-muted-foreground">
                Agora permite conectar <strong>1 Domínio Próprio</strong>, criar até <strong>5 páginas</strong> e remove nossa marca d'água. Ideal para iniciantes!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Plano Pro Expandido</p>
              <p className="text-sm text-muted-foreground">
                Crie até <strong>20 páginas</strong> e aproveite todos os recursos premium da plataforma.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <FileText className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Novo Template: Página de Captura</p>
              <p className="text-sm text-muted-foreground">
                Capture leads com formulários otimizados e ofereça <strong>iscas digitais</strong> (e-books, checklists, etc.) para aumentar sua lista.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <Users className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Nova Seção: Leads</p>
              <p className="text-sm text-muted-foreground">
                Acesse e gerencie todos os <strong>leads coletados</strong> das suas páginas de captura em um só lugar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Segurança Reforçada</p>
              <p className="text-sm text-muted-foreground">
                Nova infraestrutura de domínios para <strong>blindar seus anúncios</strong> no Facebook e outras plataformas.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full" size="lg">
          Entendi, vamos pra cima! 🚀
        </Button>
      </DialogContent>
    </Dialog>
  );
}
