import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X, Check, Play, Zap, Video, Timer, CreditCard } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TrustPage</span>
          </Link>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Novo: Player VSL integrado
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Pare de perder vendas no Linktree.{" "}
            <span className="gradient-text">Crie uma Bio de Alta Conversão</span>{" "}
            em 2 minutos.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Adicione Vídeos VSL, Botões de Pagamento e Cronômetros de Escassez no seu link da bio.
          </p>

          {/* CTA Button */}
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
              Criar Minha Página Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          {/* Social Proof */}
          <p className="mt-6 text-sm text-muted-foreground">
            Mais de <span className="font-semibold text-foreground">2.500 criadores</span> já aumentaram suas vendas
          </p>
        </div>
      </section>

      {/* Features Pills */}
      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Video className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Player VSL Limpo</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Timer className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Cronômetro de Escassez</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Botão de Pagamento</span>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            Veja a diferença
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Bad - Linktree */}
            <div className="relative">
              <div className="absolute -top-3 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-sm font-medium">
                  <X className="w-4 h-4" />
                  Antes
                </span>
              </div>
              <div className="bg-card border-2 border-destructive/30 rounded-2xl p-6 h-full">
                {/* Linktree Mock */}
                <div className="bg-muted rounded-xl p-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted-foreground/20 mx-auto" />
                  <div className="h-4 bg-muted-foreground/20 rounded w-24 mx-auto" />
                  <div className="space-y-2 pt-4">
                    <div className="h-12 bg-muted-foreground/10 rounded-lg border border-muted-foreground/20" />
                    <div className="h-12 bg-muted-foreground/10 rounded-lg border border-muted-foreground/20" />
                    <div className="h-12 bg-muted-foreground/10 rounded-lg border border-muted-foreground/20" />
                    <div className="h-12 bg-muted-foreground/10 rounded-lg border border-muted-foreground/20" />
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-4 font-medium">
                  Links chatos que não convertem
                </p>
              </div>
            </div>

            {/* Good - TrustPage */}
            <div className="relative">
              <div className="absolute -top-3 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Depois
                </span>
              </div>
              <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 h-full">
                {/* TrustPage Mock */}
                <div className="bg-black rounded-xl p-4 space-y-3">
                  {/* Profile */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <span className="text-white/70 text-xs mt-1">Método Elite</span>
                  </div>
                  
                  {/* Headline */}
                  <p className="text-white text-center text-sm font-bold leading-tight">
                    Emagreça 10kg em 30 Dias
                  </p>
                  
                  {/* Video Thumbnail with Play */}
                  <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                        <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <button className="w-full py-3 bg-green-500 text-white font-bold rounded-lg animate-pulse">
                    QUERO AGORA
                  </button>
                </div>
                <p className="text-center text-foreground mt-4 font-medium">
                  Páginas que vendem por você
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            Tudo que você precisa para vender mais
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Video className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Player VSL Limpo</h3>
              <p className="text-sm text-muted-foreground">
                Vídeos sem logos do YouTube, sem distrações. Só sua mensagem de venda.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Timer className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Gatilhos de Urgência</h3>
              <p className="text-sm text-muted-foreground">
                Cronômetros e avisos de escassez para acelerar a decisão de compra.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Pronto em 2 Minutos</h3>
              <p className="text-sm text-muted-foreground">
                Sem código, sem complicação. Publique sua página em minutos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pronto para converter mais?
          </h2>
          <p className="text-muted-foreground mb-8">
            Junte-se a milhares de criadores que já transformaram seus links em máquinas de vendas.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
              Começar Grátis Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">TrustPage</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground transition-colors">Login</Link>
            <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © 2025 TrustPage. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
