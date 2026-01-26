import { Link } from "react-router-dom";
import { ArrowRight, Zap, LayoutTemplate, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextualCTAProps {
  categorySlug: string | null;
  categoryName: string | null;
}

interface CTAContent {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  accentColor: string;
}

const getCTAContent = (categorySlug: string | null): CTAContent => {
  // Default CTA mapping based on category slug
  const ctaMap: Record<string, CTAContent> = {
    performance: {
      icon: Zap,
      title: "Acelere sua Conversão",
      description:
        "Crie landing pages ultra-rápidas que carregam em menos de 1 segundo. PageSpeed 100 garantido.",
      buttonText: "Testar Velocidade Grátis",
      accentColor: "from-yellow-500 to-orange-500",
    },
    "estratégia-trustpage": {
      icon: LayoutTemplate,
      title: "Templates de Alta Conversão",
      description:
        "Use templates validados por especialistas que já converteram milhares de visitantes em clientes.",
      buttonText: "Ver Templates Prontos",
      accentColor: "from-blue-500 to-cyan-500",
    },
    tutoriais: {
      icon: Rocket,
      title: "Comece Agora, É Grátis",
      description:
        "Crie sua primeira landing page em menos de 5 minutos. Sem código, sem complicação.",
      buttonText: "Criar Minha Página Grátis",
      accentColor: "from-primary to-purple-600",
    },
  };

  // Return matching CTA or default
  if (categorySlug && ctaMap[categorySlug]) {
    return ctaMap[categorySlug];
  }

  // Default CTA for unknown categories
  return {
    icon: Rocket,
    title: "Comece Agora, É Grátis",
    description:
      "Crie sua primeira landing page em menos de 5 minutos. Sem código, sem complicação.",
    buttonText: "Criar Minha Página Grátis",
    accentColor: "from-primary to-purple-600",
  };
};

const ContextualCTA = ({ categorySlug }: ContextualCTAProps) => {
  const cta = getCTAContent(categorySlug);
  const Icon = cta.icon;

  return (
    <div className="my-10 not-prose">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-zinc-900/80 backdrop-blur-sm",
          "border border-primary/30",
          "shadow-[0_0_30px_rgba(139,92,246,0.15)]"
        )}
      >
        {/* Gradient Accent Line */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            cta.accentColor
          )}
        />

        {/* Glow Effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br",
                cta.accentColor
              )}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                {cta.title}
              </h3>
              <p className="text-zinc-400 text-sm md:text-base">
                {cta.description}
              </p>
            </div>

            {/* Button */}
            <Link
              to="/auth"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
                "bg-gradient-to-r",
                cta.accentColor,
                "text-white font-semibold text-sm md:text-base",
                "hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300",
                "hover:scale-105 active:scale-100"
              )}
            >
              {cta.buttonText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextualCTA;
