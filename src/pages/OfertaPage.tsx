import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Shield, Zap } from "lucide-react";

// Placeholder URLs - substituir pelos links reais do Kiwify
const CHECKOUT_URLS = {
  basic_monthly: "https://pay.kiwify.com.br/basic-monthly",
  basic_yearly: "https://pay.kiwify.com.br/basic-yearly",
  pro_monthly: "https://pay.kiwify.com.br/pro-monthly",
  pro_yearly: "https://pay.kiwify.com.br/pro-yearly",
};

const OfertaPage = () => {
  const [isYearly, setIsYearly] = useState(false);

  const scrollToPricing = () => {
    document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const basicPrice = isYearly ? "33,30" : "39,90";
  const proPrice = isYearly ? "66,60" : "79,90";
  const basicCheckout = isYearly ? CHECKOUT_URLS.basic_yearly : CHECKOUT_URLS.basic_monthly;
  const proCheckout = isYearly ? CHECKOUT_URLS.pro_yearly : CHECKOUT_URLS.pro_monthly;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex justify-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TrustPage
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:pt-32 md:pb-24">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Crie Páginas de Vendas Profissionais pelo Celular em{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Minutos
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A única ferramenta com <strong>Hospedagem AWS</strong>, <strong>Anti-Bloqueio</strong> e{" "}
            <strong>Inteligência Artificial</strong> inclusas.
          </p>

          {/* Video Placeholder */}
          <div className="relative mx-auto max-w-3xl mb-10">
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl shadow-2xl border border-border/50 flex items-center justify-center overflow-hidden">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-primary border-b-[12px] border-b-transparent ml-1" />
                </div>
                <p className="text-muted-foreground text-sm">Vídeo de Apresentação (VSL)</p>
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl -z-10 opacity-50" />
          </div>

          {/* CTA Button */}
          <Button
            size="xl"
            variant="gradient"
            className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
            onClick={scrollToPricing}
          >
            QUERO COMEÇAR AGORA
          </Button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          {/* Title */}
          <h2 className="text-2xl md:text-4xl font-bold text-center text-foreground mb-4">
            Escolha o Plano Ideal para Sua Estrutura
          </h2>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Mensal
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Anual
              <span className="ml-2 text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                2 meses grátis
              </span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Basic Card */}
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">R$ {basicPrice}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cobrado anualmente (R$ 399,90/ano)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                <FeatureItem included>2 Páginas</FeatureItem>
                <FeatureItem included>Hospedagem Inclusa</FeatureItem>
                <FeatureItem included>Página VSL com Vídeo</FeatureItem>
                <FeatureItem included>Delay no Botão CTA</FeatureItem>
                <FeatureItem included>Página de Vendas completa</FeatureItem>
                <FeatureItem included>1 Domínio Personalizado</FeatureItem>
                <FeatureItem included>Pixel do Facebook/Google ADS</FeatureItem>
                <FeatureItem included>Marca d'água no rodapé</FeatureItem>
                <FeatureItem included={false}>Sem IA de Copy</FeatureItem>
              </ul>

              <a href={basicCheckout} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" size="lg" className="w-full text-base font-semibold">
                  Começar com Basic
                </Button>
              </a>
            </div>

            {/* Pro Card - Highlighted */}
            <div className="relative bg-card rounded-2xl border-2 border-primary p-8 shadow-2xl hover:shadow-3xl transition-shadow">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  MAIS VENDIDO
                </span>
              </div>

              <div className="mb-6 pt-2">
                <h3 className="text-xl font-bold text-foreground mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-primary">R$ {proPrice}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cobrado anualmente (R$ 799,90/ano)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                <FeatureItem included icon={<Zap className="w-4 h-4" />}>
                  8 Páginas Ativas
                </FeatureItem>
                <FeatureItem included>TUDO do Basic +</FeatureItem>
                <FeatureItem included icon={<Sparkles className="w-4 h-4" />}>
                  🧠 IA de Copywriting
                </FeatureItem>
                <FeatureItem included icon={<Shield className="w-4 h-4" />}>
                  🛡️ Domínios Ilimitados
                </FeatureItem>
                <FeatureItem included>🚀 Suporte VIP</FeatureItem>
                <FeatureItem included>Conecte até 3 Domínios</FeatureItem>
                <FeatureItem included>Zero Marca d'água</FeatureItem>
              </ul>

              <a href={proCheckout} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="gradient" size="lg" className="w-full text-base font-bold shadow-lg">
                  QUERO O PLANO PRO
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm text-muted-foreground mb-3">
            © {new Date().getFullYear()} TrustPage. Todos os direitos reservados.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="/termos" className="hover:text-foreground transition-colors">
              Termos de Uso
            </a>
            <span>|</span>
            <a href="/privacidade" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Item Component
interface FeatureItemProps {
  children: React.ReactNode;
  included: boolean;
  icon?: React.ReactNode;
}

const FeatureItem = ({ children, included, icon }: FeatureItemProps) => (
  <li className="flex items-center gap-3 text-sm">
    {included ? (
      icon || <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
    )}
    <span className={included ? "text-foreground" : "text-muted-foreground/60 line-through"}>
      {children}
    </span>
  </li>
);

export default OfertaPage;
