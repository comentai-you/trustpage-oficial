import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  Shield,
  Zap,
  Smartphone,
  Globe,
  Clock,
  TrendingUp,
  Lock,
  HeadphonesIcon,
  ChevronDown,
  AlertTriangle,
  Ban,
  Server,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Links reais do Kiwify
const CHECKOUT_URLS = {
  basic_monthly: "https://pay.kiwify.com.br/P7MaOJK",
  basic_yearly: "https://pay.kiwify.com.br/f8Tg6DT",
  pro_monthly: "https://pay.kiwify.com.br/ODBfbnA",
  pro_yearly: "https://pay.kiwify.com.br/TQlihDk",
};

const WHY_TRUSTPAGE = [
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "100% Mobile",
    description: "Crie e edite suas páginas direto do celular. Sem precisar de computador ou conhecimento técnico.",
    highlight: "Perfeito para quem trabalha na rua",
  },
  {
    icon: <Server className="w-8 h-8" />,
    title: "Hospedagem Vercel Premium",
    description: "Sua página fica em servidores de primeira linha, com CDN global para máxima velocidade.",
    highlight: "99.9% de uptime garantido",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Anti-Bloqueio Nativo",
    description: "Tecnologia exclusiva que protege suas páginas contra bloqueios de plataformas de tráfego.",
    highlight: "Seus anúncios continuam rodando",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Carregamento Ultra-Rápido",
    description: "Páginas otimizadas que carregam em menos de 2 segundos. Mais velocidade = mais conversão.",
    highlight: "+40% de conversão média",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Domínio Próprio Incluso",
    description: "Conecte seu domínio personalizado sem custo extra. Sua marca, sua identidade.",
    highlight: "SSL gratuito incluído",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Pixels Integrados",
    description: "Facebook Pixel e Google ADS já integrados. Rastreie conversões com precisão cirúrgica.",
    highlight: "Otimize suas campanhas",
  },
];

const PAIN_POINTS = [
  {
    icon: <Ban className="w-6 h-6" />,
    problem: "Página bloqueada pelo Facebook?",
    solution: "Nossa tecnologia anti-bloqueio mantém suas campanhas no ar",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    problem: "Cansado de plataformas lentas?",
    solution: "Hospedagem Vercel com carregamento em menos de 2 segundos",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    problem: "Não tem tempo para aprender?",
    solution: "Crie páginas profissionais em minutos, pelo celular",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    problem: "Preocupado com segurança?",
    solution: "SSL grátis e servidores protegidos 24/7",
  },
];

const FAQ_ITEMS = [
  {
    question: "Como funciona o período de teste?",
    answer:
      "Ao assinar qualquer plano, você tem 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro, sem perguntas.",
  },
  {
    question: "Preciso saber programar?",
    answer:
      "Absolutamente não! O TrustPage foi feito para quem não tem conhecimento técnico. Você edita tudo de forma visual, arrastando e clicando, direto do seu celular ou computador.",
  },
  {
    question: "O que significa 'Anti-Bloqueio'?",
    answer:
      "Muitas plataformas de anúncios bloqueiam páginas que consideram 'agressivas'. Nossa tecnologia usa domínios rotativos e estrutura de código que passa despercebida pelos algoritmos, mantendo suas campanhas no ar por mais tempo.",
  },
  {
    question: "Posso usar meu próprio domínio?",
    answer:
      "Sim! Todos os planos incluem a conexão de domínio próprio. É só apontar o DNS e sua página estará online com sua marca em minutos.",
  },
  {
    question: "Qual a diferença entre Basic e Pro?",
    answer:
      "O plano Basic é ideal para quem está começando, com 2 páginas e 1 domínio. O Pro é para quem quer escalar: 8 páginas, múltiplos domínios, IA de copywriting e suporte VIP para ajudar você a converter mais.",
  },
  {
    question: "Como funciona a IA de Copywriting?",
    answer:
      "No plano Pro, nossa IA analisa seu nicho e gera textos persuasivos para headlines, descrições e CTAs. É como ter um copywriter 24h disponível para otimizar suas conversões.",
  },
  {
    question: "Posso migrar páginas de outra plataforma?",
    answer:
      "Sim! Nosso suporte pode ajudar você a migrar suas páginas existentes. Entre em contato após a assinatura e faremos a migração sem custo adicional.",
  },
  {
    question: "O que acontece se eu cancelar?",
    answer:
      "Você pode cancelar a qualquer momento. Suas páginas continuam no ar até o fim do período já pago. Não cobramos taxas de cancelamento.",
  },
];

const OfertaPage = () => {
  const [isYearly, setIsYearly] = useState(false);

  const scrollToPricing = () => {
    document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const basicPrice = isYearly ? "37,49" : "39,90";
  const proPrice = isYearly ? "73,33" : "97,00";
  const basicCheckout = isYearly ? CHECKOUT_URLS.basic_yearly : CHECKOUT_URLS.basic_monthly;
  const proCheckout = isYearly ? CHECKOUT_URLS.pro_yearly : CHECKOUT_URLS.pro_monthly;
  const basicYearlyTotal = "449,90";
  const proYearlyTotal = "879,90";

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
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span>+2.500 páginas criadas por empreendedores como você</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Crie Páginas de Vendas Profissionais pelo Celular em{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Minutos</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            A única ferramenta com <strong className="text-foreground">Hospedagem Vercel</strong>,{" "}
            <strong className="text-foreground">Anti-Bloqueio</strong> e{" "}
            <strong className="text-foreground">Inteligência Artificial</strong> inclusas.
          </p>

          {/* Urgency */}
          <p className="text-sm text-orange-600 font-medium mb-10">
            ⚡ Oferta por tempo limitado — Preços podem aumentar a qualquer momento
          </p>

          {/* Video VSL */}
          <div className="relative mx-auto max-w-3xl mb-10">
            <div className="aspect-video rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              <iframe
                src="https://player.vimeo.com/video/1149934775?badge=0&autopause=0&player_id=0&app_id=58479"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                title="TrustPage VSL"
              />
            </div>
            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl -z-10 opacity-50" />
          </div>

          {/* CTA Button */}
          <Button
            size="xl"
            variant="gradient"
            className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all animate-pulse"
            onClick={scrollToPricing}
          >
            QUERO COMEÇAR AGORA
          </Button>

          {/* Micro-commitment */}
          <p className="text-xs text-muted-foreground mt-4">
            ✓ 7 dias de garantia incondicional &nbsp;&nbsp; ✓ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-12 px-4 bg-destructive/5 border-y border-destructive/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-xl md:text-2xl font-bold text-center text-foreground mb-8">Você já passou por isso?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PAIN_POINTS.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 text-destructive">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{item.problem}</p>
                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TrustPage Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Por que milhares escolhem
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Por que TrustPage?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Não somos apenas mais uma ferramenta de landing pages. Somos a solução completa para quem vende online.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_TRUSTPAGE.map((item, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  {item.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-8 px-4 bg-muted/50 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">2.500+</p>
              <p className="text-sm text-muted-foreground">Páginas Criadas</p>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div>
              <p className="text-3xl font-bold text-foreground">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime Garantido</p>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div>
              <p className="text-3xl font-bold text-foreground">&lt;2s</p>
              <p className="text-sm text-muted-foreground">Tempo de Carregamento</p>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div>
              <p className="text-3xl font-bold text-green-600">4.9★</p>
              <p className="text-sm text-muted-foreground">Avaliação Média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-5xl">
          {/* Title */}
          <div className="text-center mb-4">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Investimento</span>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-2">
              Escolha o Plano Ideal para Sua Estrutura
            </h2>
          </div>

          {/* Guarantee Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              <span>7 dias de garantia incondicional — Risco zero</span>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
            >
              Mensal
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-primary" />
            <span
              className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
            >
              Anual
              <span className="ml-2 text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                Economize 2 meses
              </span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Basic Card - Neutro */}
            <div className="bg-card rounded-2xl border border-border p-8 shadow-md hover:shadow-lg transition-shadow opacity-90">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-muted-foreground mb-2">Essencial</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-muted-foreground">R$ {basicPrice}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-muted-foreground mt-1">Cobrado anualmente (R$ {basicYearlyTotal}/ano)</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                <FeatureItem included>2 Páginas Ativas</FeatureItem>
                <FeatureItem included>Hospedagem Vercel Inclusa</FeatureItem>
                <FeatureItem included>Página VSL com Vídeo</FeatureItem>
                <FeatureItem included>Delay no Botão CTA</FeatureItem>
                <FeatureItem included>Página de Vendas completa</FeatureItem>
                <FeatureItem included muted>
                  Marca d'água no rodapé
                </FeatureItem>
                <FeatureItem included>Anunciar no Ads sem domínio</FeatureItem>
                <FeatureItem included={false}>Domínio Personalizado</FeatureItem>
                <FeatureItem included={false}>Pixel Facebook/Google</FeatureItem>
                <FeatureItem included={false}>IA de Copywriting</FeatureItem>
              </ul>

              <a href={basicCheckout} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" size="lg" className="w-full text-base font-semibold">
                  Começar com Essencial
                </Button>
              </a>

              <p className="text-xs text-center text-muted-foreground mt-3">Ideal para quem está começando</p>
            </div>

            {/* Pro Card - DESTAQUE MÁXIMO */}
            <div className="relative bg-card rounded-2xl border-2 border-primary p-8 shadow-2xl hover:shadow-3xl transition-shadow ring-2 ring-primary/20">
              {/* Badge Principal */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                  🔥 MAIOR DESCONTO (ECONOMIZE R$ 284)
                </span>
              </div>

              <div className="mb-6 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">Pro</h3>
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                    MAIS VENDIDO
                  </span>
                </div>

                {isYearly ? (
                  <div>
                    {/* Preço âncora riscado */}
                    <p className="text-lg text-muted-foreground line-through">De R$ 1.164,00/ano</p>
                    {/* Preço destaque */}
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-5xl font-black text-primary">12x R$ 73,32</span>
                    </div>
                    <p className="text-base text-muted-foreground mt-1">
                      ou <span className="font-bold text-foreground">R$ 879,90</span> à vista
                    </p>
                    <p className="text-sm text-green-600 font-bold mt-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg inline-block">
                      ✨ Equivale a 3 meses GRÁTIS!
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-primary">R$ {proPrice}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                <FeatureItem included icon={<Zap className="w-4 h-4 text-yellow-500" />}>
                  10 Páginas Ativas
                </FeatureItem>
                <FeatureItem included>TUDO do Essencial +</FeatureItem>
                <FeatureItem included icon={<Sparkles className="w-4 h-4 text-purple-500" />}>
                  🧠 IA de Copywriting
                </FeatureItem>
                <FeatureItem included icon={<Shield className="w-4 h-4 text-blue-500" />}>
                  🛡️ Anti-Bloqueio Avançado
                </FeatureItem>
                <FeatureItem included>✅ Domínio Personalizado Grátis</FeatureItem>
                <FeatureItem included>✅ Tracking Avançado (Pixel)</FeatureItem>
                <FeatureItem included icon={<HeadphonesIcon className="w-4 h-4 text-green-500" />}>
                  🚀 Suporte VIP Prioritário
                </FeatureItem>
                <FeatureItem included>✅ Sem Marca D'água</FeatureItem>
              </ul>

              <a href={proCheckout} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="gradient" size="lg" className="w-full text-lg font-bold shadow-lg py-6">
                  QUERO O PLANO PRO
                </Button>
              </a>

              <p className="text-xs text-center text-muted-foreground mt-3">Para quem quer escalar resultados 🚀</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-2">Formas de pagamento aceitas:</p>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <span className="text-xs bg-muted px-3 py-1 rounded-full">💳 Cartão de Crédito</span>
              <span className="text-xs bg-muted px-3 py-1 rounded-full">📱 PIX</span>
              <span className="text-xs bg-muted px-3 py-1 rounded-full">🏦 Boleto</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Tire suas dúvidas</span>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-2 mb-4">Perguntas Frequentes</h2>
            <p className="text-muted-foreground">Respondemos as dúvidas mais comuns para você decidir com confiança</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Ainda tem dúvidas?</p>
            <Button variant="outline" onClick={scrollToPricing}>
              Ver Planos e Começar Agora
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Pronto para criar suas páginas de alta conversão?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Junte-se a milhares de empreendedores que já estão vendendo mais com TrustPage
          </p>
          <Button
            size="xl"
            variant="secondary"
            className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
            onClick={scrollToPricing}
          >
            COMEÇAR AGORA — 7 DIAS DE GARANTIA
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-card">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TrustPage
          </span>
          <p className="text-sm text-muted-foreground mt-3 mb-3">
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
            <span>|</span>
            <a href="/contato" className="hover:text-foreground transition-colors">
              Contato
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
  muted?: boolean;
  warning?: boolean;
  noStrike?: boolean;
}

const FeatureItem = ({ children, included, icon, muted, warning, noStrike }: FeatureItemProps) => (
  <li className="flex items-center gap-3 text-sm">
    {included ? (
      icon || <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
    ) : (
      <X className={`w-5 h-5 flex-shrink-0 ${warning ? "text-destructive" : "text-muted-foreground/50"}`} />
    )}
    <span
      className={
        warning
          ? "text-destructive font-medium"
          : !included
            ? noStrike
              ? "text-muted-foreground"
              : "text-muted-foreground/60 line-through"
            : muted
              ? "text-muted-foreground"
              : "text-foreground"
      }
    >
      {children}
    </span>
  </li>
);

export default OfertaPage;
