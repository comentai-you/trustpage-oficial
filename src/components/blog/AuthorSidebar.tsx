import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";
import authorProfile from "@/assets/author-profile.jpg";

const AuthorSidebar = () => {
  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-sm">
        {/* Author Photo */}
        <div className="flex justify-center mb-4">
          <Avatar className="w-24 h-24 ring-4 ring-primary/20">
            <AvatarImage src={authorProfile} alt="Sandro Bispo" />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              SB
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Author Name */}
        <h3 className="text-lg font-bold text-foreground text-center mb-2">
          Sandro Bispo
        </h3>

        {/* Author Title */}
        <p className="text-xs text-primary font-medium text-center mb-4 uppercase tracking-wide">
          CEO & Fundador do TrustPage
        </p>

        {/* Short Bio */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
          Especialista em Marketing de Resposta Direta e Escala de Vendas. 
          Criador de estratégias que já geraram milhões em faturamento para infoprodutores.
        </p>

        {/* CTA Link */}
        <Link
          to="/sobre"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors group"
        >
          Conheça minha história
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
};

export default AuthorSidebar;
