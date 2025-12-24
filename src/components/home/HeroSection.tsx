import { useState } from "react";
import { Search, Shield, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { icon: Shield, label: "Transações Seguras", value: "10K+" },
    { icon: Zap, label: "Entregas Rápidas", value: "24h" },
    { icon: TrendingUp, label: "Vendedores Ativos", value: "2.5K+" },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Plataforma 100% Segura com Escrow</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up text-foreground">
            Compre e Venda{" "}
            <span className="gradient-text">Ativos Digitais</span>
            <br />
            com Confiança
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            O marketplace mais seguro para contas de games, redes sociais e serviços digitais. 
            Sistema de escrow integrado para proteção total.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative group">
              <div className="relative flex items-center bg-card border border-border rounded-xl overflow-hidden shadow-soft">
                <div className="pl-5">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar contas, serviços, games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent h-14 text-base placeholder:text-muted-foreground focus-visible:ring-0"
                />
                <Button variant="gradient" size="lg" className="m-2 rounded-lg">
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <span className="text-sm text-muted-foreground">Popular:</span>
            {["Free Fire", "Instagram", "TikTok", "Valorant", "Netflix"].map((tag) => (
              <button
                key={tag}
                className="px-3 py-1.5 text-sm bg-card hover:bg-secondary border border-border rounded-full text-foreground transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
