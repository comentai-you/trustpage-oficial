import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Check, Zap, Sparkles, Loader2, Star, Gift } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTrialExpired?: boolean;
  userFullName?: string | null;
}

const PricingModal = ({ open, onOpenChange, userFullName }: PricingModalProps) => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<'essential' | 'pro' | null>(null);

  const handleSubscribe = async (planType: 'essential' | 'pro') => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar");
      return;
    }

    setLoadingPlan(planType);

    try {
      const { data, error } = await supabase.functions.invoke('asaas-checkout', {
        body: {
          user_id: user.id,
          email: user.email,
          full_name: userFullName || user.email?.split('@')[0] || 'Cliente',
          plan_type: planType,
        },
      });

      if (error) {
        console.error('Error calling asaas-checkout:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao criar assinatura');
      }

      if (data.invoiceUrl) {
        toast.success("Redirecionando para pagamento...");
        window.location.href = data.invoiceUrl;
      } else {
        throw new Error('Link de pagamento não disponível');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Erro ao processar assinatura", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const freeFeatures = [
    "1 Bio Link Profissional",
    "Pixel do Facebook Liberado",
    "Analytics Básico",
    "Hospedagem Inclusa",
  ];

  const essentialFeatures = [
    { text: "Tudo do Gratuito +", highlight: false },
    { text: "2 Páginas Ativas", highlight: true },
    { text: "Página VSL com Vídeo", highlight: true },
    { text: "Página de Vendas", highlight: false },
    { text: "Delay no Botão CTA", highlight: true },
    { text: "1 Domínio Personalizado", highlight: false },
    { text: "Pixel do Facebook/Google ADS", highlight: false },
    { text: "Marca d'água no rodapé", highlight: false },
  ];

  const proFeatures = [
    { text: "Tudo do Essencial +", highlight: false },
    { text: "8 Páginas Ativas", highlight: true },
    { text: "Conecte até 3 Domínios", highlight: true },
    { text: "Zero Marca d'água", highlight: true },
    { text: "Pixel do Facebook/Google ADS", highlight: false },
    { text: "Suporte Prioritário", highlight: false },
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
                  <p className="text-xs text-muted-foreground">Para começar</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 0</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
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

          {/* Essential Plan - Popular */}
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
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Essencial</h3>
                  <p className="text-xs text-muted-foreground">Para escalar</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 39,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {essentialFeatures.map((feature, index) => (
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
                onClick={() => handleSubscribe("essential")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === 'essential' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Assinar Essencial
                  </>
                )}
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
                <span className="text-3xl font-bold text-foreground">R$ 79,90</span>
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
                variant="outline" 
                className="w-full"
                onClick={() => handleSubscribe("pro")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === 'pro' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar PRO
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground text-sm"
            disabled={loadingPlan !== null}
          >
            Voltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;