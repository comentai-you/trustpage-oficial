import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Check, Zap, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTrialExpired?: boolean;
}

const PricingModal = ({ open, onOpenChange, isTrialExpired = false }: PricingModalProps) => {
  const handleSubscribe = (planName: string) => {
    toast.info("Integração de pagamento será configurada em breve", {
      description: `Plano ${planName} selecionado. Aguarde a integração.`,
    });
  };

  const essentialFeatures = [
    "Até 3 Páginas Ativas",
    "Proteção contra Bloqueios",
    "Templates: VSL, Vendas e Bio",
    "Suporte por E-mail",
  ];

  const proFeatures = [
    { text: "Tudo do Essencial", highlight: false },
    { text: "10 Páginas Ativas", highlight: true },
    { text: "Prioridade no Suporte", highlight: false },
    { text: "Remoção da Marca d'água (Em breve)", highlight: false },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Crown className="w-7 h-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {isTrialExpired ? "Seu período de teste expirou" : "Escolha seu Plano"}
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            {isTrialExpired 
              ? "Assine um plano para manter suas páginas no ar" 
              : "Desbloqueie todo o potencial do TrustPage"}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Essential Plan */}
          <Card className="relative border-border/50 hover:border-primary/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Essencial</h3>
                  <p className="text-xs text-muted-foreground">Para começar</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 29,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {essentialFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSubscribe("Essencial")}
              >
                Assinar Essencial
              </Button>
            </CardContent>
          </Card>

          {/* PRO Plan */}
          <Card className="relative border-primary/50 bg-primary/5 shadow-lg shadow-primary/10">
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md">
                <Star className="w-3 h-3" fill="currentColor" />
                Mais Popular
              </span>
            </div>

            <CardContent className="p-5 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">PRO</h3>
                  <p className="text-xs text-muted-foreground">Escale suas vendas</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 69,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={feature.highlight ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="gradient" 
                className="w-full"
                onClick={() => handleSubscribe("PRO")}
              >
                <Zap className="w-4 h-4 mr-2" />
                Quero ser PRO
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground text-sm"
          >
            Voltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
