import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Check, Zap } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const features = [
    "Até 5 páginas ativas",
    "Templates VSL, Sales Page e Bio Link",
    "Personalização completa de cores e temas",
    "Suporte via chat",
    "Domínio trustpageapp.com/p/seulink",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Seu período de teste expirou
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Continue usando o TrustPage assinando o plano Essencial e mantenha suas páginas no ar.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Plano Essencial</span>
            <span className="ml-auto text-lg font-bold text-foreground">
              R$ 29,90<span className="text-sm font-normal text-muted-foreground">/mês</span>
            </span>
          </div>
          
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <Button 
            variant="gradient" 
            size="lg" 
            className="w-full"
            disabled
          >
            <Zap className="w-4 h-4 mr-2" />
            Em Breve - Entrar na Lista de Espera
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Voltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
