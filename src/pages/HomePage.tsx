import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Video, CreditCard, Zap, ArrowRight, CheckCircle2, Sparkles, Check, Clock, Menu, X } from "lucide-react";
import { useState } from "react";
import FAQSection from "@/components/FAQSection";

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">TrustPage</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/auth?mode=login">
              <Button variant="ghost" className="font-medium">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="gradient-button font-semibold px-4 sm:px-6">
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-background border-b border-border px-4 py-4 space-y-3">
            <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-center font-medium">
                Login
              </Button>
            </Link>
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full gradient-button font-semibold">
                Começar Grátis
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section with Mesh Gradient */}
      <section className="relative min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-20 mesh-gradient overflow-hidden">
        {/* Decorative elements - smaller on mobile */}
        <div className="absolute top-20 left-0 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 sm:space-y-8 animate-fade-in text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">
                  A evolução do link na bio
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight text-foreground">
                Transforme seguidores em{" "}
                <span className="gradient-text">clientes</span> com uma única página.
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Comece com seu Bio Link Profissional de Graça.{" "}
                <span className="text-foreground font-medium">Escale com VSLs quando estiver pronto.</span>
              </p>
              
              <div className="flex justify-center lg:justify-start">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto gradient-button text-lg sm:text-xl px-10 sm:px-14 py-6 sm:py-7 font-bold group shadow-lg">
                    Criar Minha Página Grátis
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-2 sm:pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">Grátis para começar</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">Sem cartão de crédito</span>
                </div>
              </div>
            </div>

            {/* Right: Phone Mockup - Hidden on mobile, visible on lg+ */}
            <div className="relative justify-center lg:justify-end animate-float hidden lg:flex">
              <div className="phone-mockup">
                {/* iPhone Frame */}
                <div className="w-[280px] xl:w-[340px] bg-foreground rounded-[50px] p-3">
                  {/* Dynamic Island */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-7 bg-foreground rounded-full z-10" />
                  
                  {/* Screen */}
                  <div className="w-full aspect-[9/19] bg-gradient-to-b from-slate-900 to-slate-800 rounded-[42px] overflow-hidden relative">
                    {/* Mock Content */}
                    <div className="p-4 xl:p-6 pt-12 space-y-4">
                      {/* Profile */}
                      <div className="flex flex-col items-center">
                        <div className="w-14 xl:w-16 h-14 xl:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg xl:text-xl">
                          M
                        </div>
                        <p className="mt-2 text-white/70 text-xs xl:text-sm">Método Elite</p>
                      </div>
                      
                      {/* Headline */}
                      <h3 className="text-white text-sm xl:text-lg font-bold text-center leading-tight">
                        Descubra Como Emagrecer 10kg em 30 Dias
                      </h3>
                      
                      {/* Video Placeholder */}
                      <div className="aspect-video bg-slate-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="w-12 xl:w-14 h-12 xl:h-14 rounded-full bg-primary flex items-center justify-center animate-pulse">
                          <Play className="w-5 xl:w-7 h-5 xl:h-7 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <button className="w-full py-3 xl:py-4 rounded-xl bg-emerald-500 text-white font-bold text-xs xl:text-sm animate-pulse">
                        QUERO AGORA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating badges - hidden on smaller screens */}
              <div className="absolute -left-4 top-1/4 bg-card rounded-xl p-3 shadow-3d border border-border/50 animate-fade-in hidden xl:block" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Rápido</span>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/3 bg-card rounded-xl p-3 shadow-3d border border-border/50 animate-fade-in hidden xl:block" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Video className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">VSL</span>
                </div>
              </div>
            </div>

            {/* Mobile Phone Preview - Only on mobile/tablet */}
            <div className="relative flex justify-center lg:hidden mt-4">
              <div className="w-[220px] sm:w-[260px] bg-foreground rounded-[40px] p-2.5 shadow-2xl">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-foreground rounded-full z-10" />
                <div className="w-full aspect-[9/19] bg-gradient-to-b from-slate-900 to-slate-800 rounded-[35px] overflow-hidden relative">
                  <div className="p-4 pt-10 space-y-3">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                        M
                      </div>
                      <p className="mt-1.5 text-white/70 text-xs">Método Elite</p>
                    </div>
                    <h3 className="text-white text-xs font-bold text-center leading-tight">
                      Descubra Como Emagrecer 10kg
                    </h3>
                    <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-pulse">
                        <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    <button className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-bold text-xs">
                      QUERO AGORA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-xs sm:text-sm mb-4">
              Por que TrustPage?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 sm:mb-4">
              Tudo que você precisa para{" "}
              <span className="gradient-text">vender mais</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Recursos poderosos projetados para maximizar suas conversões
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Card 1 - VSL */}
            <div className="card-3d p-6 sm:p-8 space-y-3 sm:space-y-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Video className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Vídeo VSL Integrado</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Player de vídeo com capa personalizada e botão de play pulsante. Sem distrações do YouTube.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium text-sm sm:text-base">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2 - Payment */}
            <div className="card-3d p-6 sm:p-8 space-y-3 sm:space-y-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <CreditCard className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Pagamento Direto</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Integre Hotmart, Kiwify, Eduzz ou qualquer plataforma. Link direto para o checkout.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium text-sm sm:text-base">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3 - Speed */}
            <div className="card-3d p-6 sm:p-8 space-y-3 sm:space-y-4 sm:col-span-2 md:col-span-1">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Carregamento Relâmpago</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Páginas ultra-rápidas otimizadas para mobile. Não perca vendas por lentidão.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium text-sm sm:text-base">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Bar */}
      <section className="py-8 sm:py-12 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:gap-8">
            <p className="text-muted-foreground font-medium text-sm sm:text-base">Aceite pagamentos via:</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8">
              {/* Pix */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-card rounded-lg border border-border">
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded bg-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-[10px] sm:text-xs">PIX</span>
                </div>
                <span className="font-semibold text-foreground text-sm sm:text-base">Pix</span>
              </div>
              
              {/* Card */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-card rounded-lg border border-border">
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded bg-blue-600 flex items-center justify-center">
                  <CreditCard className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
                </div>
                <span className="font-semibold text-foreground text-sm sm:text-base">Cartão</span>
              </div>
              
              {/* Boleto */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-card rounded-lg border border-border">
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-[10px] sm:text-xs">₿</span>
                </div>
                <span className="font-semibold text-foreground text-sm sm:text-base">Boleto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-xs sm:text-sm mb-4">
              Preços simples
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 sm:mb-4 px-4">
              Escolha o plano ideal para{" "}
              <span className="gradient-text">seu negócio</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Comece grátis e faça upgrade quando precisar de mais páginas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* FREE Card */}
            <div className="relative">
              <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-border shadow-elevated h-full">
                <div className="pt-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Gratuito</h3>
                  <div className="flex items-baseline gap-1 mb-5 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-foreground">R$ 0</span>
                    <span className="text-muted-foreground text-sm sm:text-base">/mês</span>
                  </div>
                  
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">
                        <span className="font-bold">1 Bio Link</span> Profissional
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">Pixel do Facebook Liberado</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">Analytics Básico</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">Hospedagem Inclusa</span>
                    </li>
                  </ul>
                  
                  <Link to="/auth">
                    <Button variant="outline" className="w-full text-base sm:text-lg py-5 sm:py-6 font-semibold border-2">
                      Começar Grátis
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Essencial Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl sm:rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-primary shadow-3d h-full">
                {/* Badge */}
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                  <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-primary text-primary-foreground text-xs sm:text-sm font-bold rounded-full shadow-glow whitespace-nowrap">
                    Mais Popular
                  </span>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Essencial</h3>
                  <div className="flex items-baseline gap-1 mb-5 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-foreground">R$ 29,90</span>
                    <span className="text-muted-foreground text-sm sm:text-base">/mês</span>
                  </div>
                  
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">
                        Crie até <span className="font-bold text-primary">2 Páginas</span> Ativas
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base font-semibold">Página VSL com Vídeo</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base font-semibold">Delay no Botão CTA</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">Página de Vendas completa</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">1 Domínio Personalizado</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">Pixel do Facebook/Google ADS</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">Marca d'água no rodapé</span>
                    </li>
                  </ul>
                  
                  <Link to="/auth">
                    <Button className="w-full gradient-button text-base sm:text-lg py-5 sm:py-6 font-bold">
                      Assinar Essencial
                      <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Pro Card */}
            <div className="relative">
              <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-border shadow-elevated h-full">
                <div className="pt-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1 mb-5 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-foreground">R$ 69,90</span>
                    <span className="text-muted-foreground text-sm sm:text-base">/mês</span>
                  </div>
                  
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">
                        Crie até <span className="font-bold">8 Páginas</span> Ativas
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base font-semibold">Conecte até 3 Domínios</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base font-semibold">Zero Marca d'água</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">Pixel do Facebook/Google ADS</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base">Suporte Prioritário</span>
                    </li>
                  </ul>
                  
                  <Link to="/auth">
                    <Button variant="outline" className="w-full text-base sm:text-lg py-5 sm:py-6 font-semibold border-2">
                      Assinar Pro
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-16 sm:py-24 mesh-gradient relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground px-4">
              Pronto para{" "}
              <span className="gradient-text">multiplicar suas vendas?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Crie sua primeira página de alta conversão em menos de 2 minutos. 
              Sem conhecimento técnico necessário.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gradient-button text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 font-bold group">
                Criar Minha Página Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:gap-6 text-center sm:text-left sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold">TrustPage</span>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-primary-foreground/70">
              <Link to="/termos" className="hover:text-primary-foreground transition-colors">Termos</Link>
              <Link to="/privacidade" className="hover:text-primary-foreground transition-colors">Privacidade</Link>
              <Link to="/contato" className="hover:text-primary-foreground transition-colors">Contato</Link>
            </div>
            
            <p className="text-xs sm:text-sm text-primary-foreground/50">
              © 2025 TrustPage. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
