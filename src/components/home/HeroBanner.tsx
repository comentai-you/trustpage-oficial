const HeroBanner = () => {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Compre e Venda Ativos Digitais
            <span className="text-primary"> com Segurança</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Contas de jogos, redes sociais e serviços digitais. 
            Sistema Escrow para transações 100% seguras.
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-10">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">15k+</p>
              <p className="text-sm text-muted-foreground">Vendedores</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">50k+</p>
              <p className="text-sm text-muted-foreground">Transações</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">99%</p>
              <p className="text-sm text-muted-foreground">Satisfação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
