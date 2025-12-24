import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const HeroBanner = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
          
          {/* Large Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="O que você está procurando?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 text-base bg-card border-border"
              />
            </div>
            <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Buscar
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mt-10">
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
