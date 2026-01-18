import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Check, Zap, Sparkles, Star, Gift, X, Eye, Globe, Brain } from "lucide-react";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTrialExpired?: boolean;
  userFullName?: string | null;
}

// Links externos para checkout na Kiwify
const KIWIFY_LINKS = {
  essential_monthly: 'https://pay.kiwify.com.br/P7MaOJK',
  pro_monthly: 'https://pay.kiwify.com.br/f0lsmRn',
  essential_yearly: 'https://pay.kiwify.com.br/f8Tg6DT',
  pro_yearly: 'https://pay.kiwify.com.br/TQlihDk',
};

const PricingModal = ({ open, onOpenChange }: PricingModalProps) => {

  const handleSubscribe = (planKey: keyof typeof KIWIFY_LINKS) => {
    const url = KIWIFY_LINKS[planKey];
    window.open(url, '_blank');
    onOpenChange(false);
  };

  const freeFeatures = [
    { text: "1 Página Ativa", included: true },
    { text: "Todos os Templates", included: true },
    { text: "1.000 visualizações/mês", included: true, muted: true },
    { text: "Marca d'água obrigatória", included: true, muted: true },
    { text: "Domínio Personalizado", included: false },
  ];

  const essentialFeatures = [
    { text: "5 Páginas Ativas", included: true, highlight: true },
    { text: "1 Domínio Personalizado", included: true, highlight: true },
    { text: "Zero Marca d'água", included: true, highlight: true },
    { text: "Visualizações Ilimitadas", included: true },
    { text: "Todos os Templates", included: true },
    { text: "Pixel Facebook/Google", included: true },
  ];

  const proFeatures = [
    { text: "20 Páginas Ativas", included: true, highlight: true },
    { text: "5 Domínios Personalizados", included: true, highlight: true },
    { text: "IA de Copywriting", included: true, highlight: true },
    { text: "Zero Marca d'água", included: true },
    { text: "Visualizações Ilimitadas", included: true },
    { text: "Suporte Prioritário", included: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Crown className="w-7 h-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Escolha seu Plano
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Desbloqueie todo o potencial do TrustPage
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* FREE Plan */}
          <Card className="relative border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Gift className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Gratuito</h3>
                  <p className="text-xs text-muted-foreground">Para testar</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 0</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    {feature.included ? (
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${feature.muted ? 'text-muted-foreground' : 'text-green-500'}`} />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? (feature.muted ? 'text-muted-foreground' : 'text-foreground') : 'text-muted-foreground/60 line-through'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Plano Atual
              </Button>
            </CardContent>
          </Card>

          {/* Essential Plan - DESTAQUE */}
          <Card className="relative border-2 border-primary bg-primary/5 shadow-xl shadow-primary/20">
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
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Essencial</h3>
                  <p className="text-xs text-muted-foreground">Para escalar</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">R$ 39,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {essentialFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={feature.highlight ? "font-semibold text-foreground" : "text-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="gradient" 
                className="w-full font-semibold"
                onClick={() => handleSubscribe("essential_monthly")}
              >
                <Zap className="w-4 h-4 mr-2" />
                Assinar Essencial
              </Button>
            </CardContent>
          </Card>

          {/* PRO Plan */}
          <Card className="relative border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">PRO</h3>
                  <p className="text-xs text-muted-foreground">Para profissionais</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 97,00</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={feature.highlight ? "font-semibold text-foreground" : "text-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSubscribe("pro_monthly")}
              >
                <Crown className="w-4 h-4 mr-2" />
                Assinar PRO
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