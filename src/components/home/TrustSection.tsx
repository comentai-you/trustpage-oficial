import { Shield, Lock, Clock, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Sistema Escrow",
    description: "Seu dinheiro fica protegido até você confirmar o recebimento do produto.",
  },
  {
    icon: Lock,
    title: "Transações Criptografadas",
    description: "Toda comunicação e dados são protegidos com criptografia de ponta.",
  },
  {
    icon: Clock,
    title: "Proteção 48h",
    description: "Após confirmar o recebimento, há um período de 48h para garantir a entrega.",
  },
  {
    icon: Headphones,
    title: "Suporte 24/7",
    description: "Equipe dedicada para resolver qualquer problema via Telegram ou chat.",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-secondary/30">
      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 font-medium">Segurança Garantida</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Por que escolher a <span className="gradient-text">TrustMarket?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Construímos a plataforma mais segura do Brasil para negociação de ativos digitais
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 bg-card rounded-xl border border-border animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5 mx-auto">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 glass-card p-8 md:p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Pronto para começar?
                </h3>
                <p className="text-muted-foreground">
                  Crie sua conta gratuitamente e comece a vender hoje mesmo.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://t.me/trustmarket_suporte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  Suporte Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
