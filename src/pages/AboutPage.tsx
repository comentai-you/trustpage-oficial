import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Target, Zap, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import authorProfile from "@/assets/author-profile.jpg";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">TrustPage</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                to="/blog" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link 
                to="/auth" 
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Começar Grátis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            {/* Photo */}
            <div className="shrink-0">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden ring-8 ring-primary/20 shadow-2xl">
                <img 
                  src={authorProfile} 
                  alt="Sandro Bispo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Intro Text */}
            <div className="text-center lg:text-left">
              <p className="text-primary font-medium mb-2 uppercase tracking-wide text-sm">
                Prazer, eu sou
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Sandro Bispo
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                CEO & Fundador do TrustPage
              </p>
              <p className="text-lg text-muted-foreground max-w-xl">
                Especialista em <strong className="text-foreground">Marketing de Resposta Direta</strong> e 
                <strong className="text-foreground"> Escala de Vendas</strong>. Há mais de uma década ajudando 
                infoprodutores a transformar cliques em clientes de forma ética e lucrativa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Minha Jornada
            </h2>
            
            <div className="space-y-6 text-muted-foreground">
              <p>
                Tudo começou quando eu percebi que a maioria dos infoprodutores estava perdendo 
                vendas por um motivo simples: <strong className="text-foreground">falta de confiança</strong>. 
                Páginas mal feitas, sem prova social, sem clareza na proposta de valor.
              </p>
              
              <p>
                Eu mesmo já passei por isso. Criei produtos incríveis que ninguém comprava, 
                simplesmente porque minhas páginas não transmitiam a credibilidade necessária. 
                Foi frustrante, mas me ensinou algo valioso.
              </p>
              
              <p>
                Depois de anos estudando os melhores copywriters do mundo — de Eugene Schwartz a 
                Gary Halbert — e testando centenas de páginas, descobri os padrões que realmente 
                convertem. Não é sobre ser "bonito". É sobre ser <strong className="text-foreground">
                persuasivo</strong>.
              </p>
              
              <p>
                O <strong className="text-foreground">TrustPage</strong> nasceu dessa obsessão por 
                conversão. Eu queria criar uma ferramenta que permitisse qualquer pessoa — mesmo 
                sem conhecimento técnico — construir páginas que vendem de verdade.
              </p>
              
              <p>
                Páginas que passam no crivo dos algoritmos do Facebook e Google, que transmitem 
                autoridade, que usam os princípios de persuasão comprovados há décadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Minha Filosofia de Marketing
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Clareza Vence Criatividade</h3>
                <p className="text-muted-foreground">
                  Não importa quão criativo seja seu anúncio se o cliente não entender 
                  o que você vende em 3 segundos. Simplicidade é sofisticação.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Confiança Primeiro</h3>
                <p className="text-muted-foreground">
                  Antes de pedir a venda, construa credibilidade. Depoimentos, provas sociais, 
                  garantias — tudo isso reduz a fricção e aumenta conversões.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Velocidade é Tudo</h3>
                <p className="text-muted-foreground">
                  No digital, quem testa mais rápido, vence. Por isso o TrustPage foi feito 
                  para você lançar páginas em minutos, não dias.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Foco no Cliente</h3>
                <p className="text-muted-foreground">
                  Sua página não é sobre você. É sobre a transformação que você oferece. 
                  Fale menos de features, mais de resultados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 max-w-2xl mx-auto">
            Pronto para criar páginas que realmente convertem?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            O TrustPage foi criado por alguém que entende a sua dor. 
            Eu sei o que funciona porque já testei de tudo.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Criar Minha Página Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TrustPage. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/termos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos
              </Link>
              <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link to="/contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
