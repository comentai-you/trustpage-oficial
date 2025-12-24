import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Video, CreditCard, Zap, ArrowRight, CheckCircle2, Sparkles, Check, Clock } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TrustPage</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="font-medium">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="gradient-button font-semibold px-6">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Mesh Gradient */}
      <section className="relative min-h-screen pt-32 pb-20 mesh-gradient overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  A evolução do link na bio
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight text-foreground">
                Transforme seguidores em{" "}
                <span className="gradient-text">clientes</span> com uma única página.
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                A ferramenta definitiva para vender serviços e infoprodutos na bio.{" "}
                <span className="text-foreground font-medium">Sem designers, sem código.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="gradient-button text-lg px-8 py-6 font-bold group">
                    Começar Grátis
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 font-medium border-2">
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
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

            {/* Right: Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end animate-float">
              <div className="phone-mockup">
                {/* iPhone Frame */}
                <div className="w-[300px] lg:w-[340px] bg-foreground rounded-[50px] p-3">
                  {/* Dynamic Island */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-7 bg-foreground rounded-full z-10" />
                  
                  {/* Screen */}
                  <div className="w-full aspect-[9/19] bg-gradient-to-b from-slate-900 to-slate-800 rounded-[42px] overflow-hidden relative">
                    {/* Mock Content */}
                    <div className="p-6 pt-12 space-y-4">
                      {/* Profile */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl">
                          M
                        </div>
                        <p className="mt-2 text-white/70 text-sm">Método Elite</p>
                      </div>
                      
                      {/* Headline */}
                      <h3 className="text-white text-lg font-bold text-center leading-tight">
                        Descubra Como Emagrecer 10kg em 30 Dias
                      </h3>
                      
                      {/* Video Placeholder */}
                      <div className="aspect-video bg-slate-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center animate-pulse">
                          <Play className="w-7 h-7 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <button className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-sm animate-pulse">
                        QUERO AGORA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -left-4 top-1/4 bg-card rounded-xl p-3 shadow-3d border border-border/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Rápido</span>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/3 bg-card rounded-xl p-3 shadow-3d border border-border/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Video className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">VSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
              Por que TrustPage?
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4">
              Tudo que você precisa para{" "}
              <span className="gradient-text">vender mais</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recursos poderosos projetados para maximizar suas conversões
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 - VSL */}
            <div className="card-3d p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Vídeo VSL Integrado</h3>
              <p className="text-muted-foreground leading-relaxed">
                Player de vídeo com capa personalizada e botão de play pulsante. Sem distrações do YouTube.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2 - Payment */}
            <div className="card-3d p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Pagamento Direto</h3>
              <p className="text-muted-foreground leading-relaxed">
                Integre Hotmart, Kiwify, Eduzz ou qualquer plataforma. Link direto para o checkout.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3 - Speed */}
            <div className="card-3d p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Carregamento Relâmpago</h3>
              <p className="text-muted-foreground leading-relaxed">
                Páginas ultra-rápidas otimizadas para mobile. Não perca vendas por lentidão.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                <span>Saiba mais</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Bar */}
      <section className="py-12 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <p className="text-muted-foreground font-medium">Aceite pagamentos via:</p>
            <div className="flex items-center gap-8">
              {/* Pix */}
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
                <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">PIX</span>
                </div>
                <span className="font-semibold text-foreground">Pix</span>
              </div>
              
              {/* Card */}
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">Cartão</span>
              </div>
              
              {/* Boleto */}
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
                <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">₿</span>
                </div>
                <span className="font-semibold text-foreground">Boleto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
              Preços simples
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4">
              Escolha o plano ideal para{" "}
              <span className="gradient-text">seu negócio</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e faça upgrade quando precisar de mais páginas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Essencial Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-card rounded-2xl p-8 border-2 border-primary shadow-3d">
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-glow">
                    Mais Popular
                  </span>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Essencial</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-foreground">R$ 29,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        Crie até <span className="font-bold text-primary">5 Páginas</span> Ativas
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Vídeo VSL Integrado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Botões de Pagamento</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Hospedagem Inclusa</span>
                    </li>
                  </ul>
                  
                  <Link to="/auth">
                    <Button className="w-full gradient-button text-lg py-6 font-bold">
                      Começar com 5 Páginas
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Pro Card */}
            <div className="relative opacity-80">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-elevated">
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-muted text-muted-foreground text-sm font-semibold rounded-full border border-border">
                    <Clock className="w-4 h-4" />
                    Em Breve
                  </span>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-foreground">R$ 69,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        Crie até <span className="font-bold">20 Páginas</span> Ativas
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Pixel de Rastreamento (Meta/Google)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Domínio Personalizado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">Sem Marca d'água</span>
                    </li>
                  </ul>
                  
                  <Button variant="outline" className="w-full text-lg py-6 font-semibold border-2" disabled>
                    Entrar na Lista de Espera
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 mesh-gradient relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-black text-foreground">
              Pronto para{" "}
              <span className="gradient-text">multiplicar suas vendas?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Crie sua primeira página de alta conversão em menos de 2 minutos. 
              Sem conhecimento técnico necessário.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gradient-button text-lg px-10 py-7 font-bold group">
                Criar Minha Página Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TrustPage</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-primary-foreground/70">
              <a href="#" className="hover:text-primary-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-primary-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary-foreground transition-colors">Contato</a>
            </div>
            
            <p className="text-sm text-primary-foreground/50">
              © 2025 TrustPage. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
