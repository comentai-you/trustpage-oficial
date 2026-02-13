import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Bio Link images
import templateBio1 from "@/assets/template-bio-1.png";
import templateBio2 from "@/assets/template-bio-2.png";

// Captura images
import templateCaptura1 from "@/assets/template-captura-1.png";
import templateCaptura2 from "@/assets/template-captura-2.png";
import templateCaptura3 from "@/assets/template-captura-3.png";

// Página de Vendas images
import templateVendas1 from "@/assets/template-vendas-1.png";
import templateVendas2 from "@/assets/template-vendas-2.png";
import templateVendas3 from "@/assets/template-vendas-3.png";

// VSL images
import templateVsl1 from "@/assets/template-vsl-1.png";
import templateVsl2 from "@/assets/template-vsl-2.png";
import templateVsl3 from "@/assets/template-vsl-3.png";

// Pre-sell images
import templatePresell1 from "@/assets/template-presell-1.png";
import templatePresell2 from "@/assets/template-presell-2.png";

// Quiz images
import templateQuiz1 from "@/assets/template-quiz-1.png";
import templateQuiz2 from "@/assets/template-quiz-2.png";

// Clonador images
import templateClonador1 from "@/assets/template-clonador-1.png";
import templateClonador2 from "@/assets/template-clonador-2.png";

interface ShowcaseImage {
  src: string;
  alt: string;
  caption?: string;
}

interface TemplateSectionProps {
  badge: string;
  badgeColor: string;
  title: string;
  highlightedWord: string;
  description: string;
  features: string[];
  images: ShowcaseImage[];
  reversed?: boolean;
  bgClass?: string;
}

const TemplateSection = ({
  badge,
  badgeColor,
  title,
  highlightedWord,
  description,
  features,
  images,
  reversed = false,
  bgClass = "bg-background",
}: TemplateSectionProps) => {
  // Split title by highlighted word
  const parts = title.split(highlightedWord);

  return (
    <section className={`py-16 sm:py-24 ${bgClass} relative overflow-hidden`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span
            className={`inline-block px-3 sm:px-4 py-2 ${badgeColor} rounded-full font-semibold text-xs sm:text-sm mb-4`}
          >
            {badge}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 sm:mb-4">
            {parts[0]}
            <span className="gradient-text">{highlightedWord}</span>
            {parts[1] || ""}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {description}
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 max-w-3xl mx-auto">
          {features.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-foreground"
            >
              ✅ {f}
            </span>
          ))}
        </div>

        {/* Images Grid */}
        {images.length === 2 && (
          <div className={`grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto ${reversed ? "direction-rtl" : ""}`}>
            {images.map((img, i) => (
              <div key={i} className="space-y-3" style={{ direction: "ltr" }}>
                <div className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden p-2 sm:p-3 hover:shadow-lg transition-shadow">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full rounded-xl"
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <p className="text-center text-xs sm:text-sm text-muted-foreground font-medium">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length === 3 && (
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            {/* First image full width */}
            <div className="space-y-3">
              <div className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden p-2 sm:p-3 hover:shadow-lg transition-shadow max-w-4xl mx-auto">
                <img
                  src={images[0].src}
                  alt={images[0].alt}
                  className="w-full rounded-xl"
                  loading="lazy"
                />
              </div>
              {images[0].caption && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground font-medium">
                  {images[0].caption}
                </p>
              )}
            </div>
            {/* Two images side by side */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {images.slice(1).map((img, i) => (
                <div key={i} className="space-y-3">
                  <div className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden p-2 sm:p-3 hover:shadow-lg transition-shadow">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full rounded-xl"
                      loading="lazy"
                    />
                  </div>
                  {img.caption && (
                    <p className="text-center text-xs sm:text-sm text-muted-foreground font-medium">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const TemplateShowcaseSections = () => {
  return (
    <>
      {/* Link na Bio */}
      <TemplateSection
        badge="🔗 Link na Bio"
        badgeColor="bg-pink-500/10 text-pink-600 dark:text-pink-400"
        title="Seu Link na Bio profissional"
        highlightedWord="profissional"
        description="Reúna todos os seus links em uma única página elegante. Perfeito para Instagram, TikTok e qualquer rede social."
        features={[
          "Avatar e bio personalizáveis",
          "Redes sociais integradas",
          "Links com destaque e thumbnails",
          "Temas e cores customizáveis",
        ]}
        images={[
          {
            src: templateBio1,
            alt: "Editor do Link na Bio do TrustPage — configuração de perfil, avatar e redes sociais",
            caption: "Editor completo com preview em tempo real",
          },
          {
            src: templateBio2,
            alt: "Editor do Link na Bio do TrustPage — redes sociais e links configurados",
            caption: "Redes sociais e links personalizados",
          },
        ]}
        bgClass="bg-muted/30"
      />

      {/* Página de Captura */}
      <TemplateSection
        badge="🧲 Página de Captura"
        badgeColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        title="Capture leads com páginas de alta conversão"
        highlightedWord="alta conversão"
        description="Visual premium para E-books, Iscas Digitais e Lançamentos. Com formulário inteligente, isca digital e entrega automática."
        features={[
          "Formulário configurável (nome, email, telefone)",
          "Isca digital com upload de arquivo",
          "Imagem de produto ajustável",
          "Webhook para automações externas",
        ]}
        images={[
          {
            src: templateCaptura1,
            alt: "Editor de Página de Captura do TrustPage — configuração de slug, headline e imagem de capa",
            caption: "Configurações da página e preview desktop + mobile",
          },
          {
            src: templateCaptura2,
            alt: "Editor de Página de Captura do TrustPage — campos do formulário e conteúdo",
            caption: "Campos do formulário e conteúdo personalizáveis",
          },
          {
            src: templateCaptura3,
            alt: "Editor de Página de Captura do TrustPage — isca digital e upload de arquivo",
            caption: "Isca digital com entrega automática de arquivo",
          },
        ]}
        bgClass="bg-background"
      />

      {/* Página de Vendas */}
      <TemplateSection
        badge="🛒 Página de Vendas"
        badgeColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        title="Monte sua Página de Vendas completa"
        highlightedWord="Página de Vendas"
        description="Section Builder poderoso com 14+ blocos: Hero, Benefícios, Depoimentos, FAQ, Oferta, Vídeo e muito mais. Arraste e reordene como quiser."
        features={[
          "14+ tipos de seções arrastáveis",
          "6 temas profissionais prontos",
          "Preview desktop e mobile em tempo real",
          "Cérebro IA para copywriting",
        ]}
        images={[
          {
            src: templateVendas1,
            alt: "Editor de Página de Vendas do TrustPage — temas profissionais e Section Builder",
            caption: "Temas profissionais e Section Builder com drag & drop",
          },
          {
            src: templateVendas2,
            alt: "Editor de Página de Vendas do TrustPage — headline, subheadline e preview",
            caption: "Edição de headline com preview em tempo real",
          },
          {
            src: templateVendas3,
            alt: "Editor de Página de Vendas do TrustPage — modal de adicionar seção com 14+ blocos",
            caption: "14+ tipos de seções para montar sua página",
          },
        ]}
        bgClass="bg-muted/30"
      />

      {/* Template VSL */}
      <TemplateSection
        badge="▶️ Template VSL"
        badgeColor="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        title="Página VSL focada em conversão"
        highlightedWord="conversão"
        description="Design limpo e direto ao ponto. Foco total no vídeo de vendas com CTA estratégico que aparece no momento certo."
        features={[
          "Suporte a YouTube, Vimeo e Panda",
          "CTA com delay por % do vídeo",
          "Temas Dark, Light e Modern Gray",
          "5 cores de botão prontas",
        ]}
        images={[
          {
            src: templateVsl1,
            alt: "Editor VSL do TrustPage — configuração de página, slug e headline",
            caption: "Configurações da página com preview em tempo real",
          },
          {
            src: templateVsl2,
            alt: "Editor VSL do TrustPage — vídeo, orientação e botão CTA com delay",
            caption: "Vídeo com CTA inteligente que aparece após % assistido",
          },
          {
            src: templateVsl3,
            alt: "Editor VSL do TrustPage — temas, cores de botão e aparência",
            caption: "Temas e cores personalizáveis para cada nicho",
          },
        ]}
        bgClass="bg-background"
      />

      {/* Pre-sell de Cookies */}
      <TemplateSection
        badge="🍪 Pre-sell Anti-Bloqueio"
        badgeColor="bg-red-500/10 text-red-600 dark:text-red-400"
        title="Cookie Wall que protege seus anúncios"
        highlightedWord="protege seus anúncios"
        description="Simule um aviso de privacidade (LGPD) sobre a página de vendas real. O visitante clica em 'Aceitar' e é redirecionado ao seu link de destino."
        features={[
          "Background desktop e mobile separados",
          "Posição centralizada ou inferior",
          "Estilo claro ou escuro",
          "Texto do aviso editável",
        ]}
        images={[
          {
            src: templatePresell1,
            alt: "Editor Pre-sell do TrustPage — configuração Cookie Wall com prints desktop e mobile",
            caption: "Configuração do Cookie Wall com preview em tempo real",
          },
          {
            src: templatePresell2,
            alt: "Editor Pre-sell do TrustPage — posição do aviso e estilo do card",
            caption: "Posição, estilo e texto do aviso personalizáveis",
          },
        ]}
        bgClass="bg-muted/30"
      />

      {/* Quiz Interativo */}
      <TemplateSection
        badge="❓ Quiz Interativo"
        badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        title="Funis de Quiz para qualificar leads"
        highlightedWord="qualificar leads"
        description="Crie quizzes estilo Typeform com perguntas, imagens e opções de resposta. No final, redirecione o lead para seu checkout ou grupo."
        features={[
          "Perguntas com imagem opcional",
          "Opções de resposta com emojis",
          "Redirecionamento final configurável",
          "Design mobile-first com transições suaves",
        ]}
        images={[
          {
            src: templateQuiz1,
            alt: "Editor de Quiz do TrustPage — perguntas, opções de resposta e imagem",
            caption: "Editor de perguntas com opções e imagens",
          },
          {
            src: templateQuiz2,
            alt: "Visualização pública do Quiz do TrustPage — tela inicial com botão começar",
            caption: "Visualização pública do quiz com design limpo",
          },
        ]}
        bgClass="bg-background"
      />

      {/* Clonador de Páginas */}
      <TemplateSection
        badge="✨ Clonador de Páginas"
        badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        title="Clone qualquer página em segundos"
        highlightedWord="qualquer página"
        description="Cole a URL de qualquer página de vendas, clone com 1 clique e substitua todos os links para o seu checkout. Inclui suporte a Pixel e Back Redirect."
        features={[
          "Substituição global de links",
          "Scripts do Head (Pixel/GTM)",
          "Preview em tempo real (Desktop/Mobile)",
          "Back Redirect para retenção",
        ]}
        images={[
          {
            src: templateClonador1,
            alt: "Editor de Página Clonada do TrustPage — substituição de links e preview",
            caption: "Substituição global de links com preview em tempo real",
          },
          {
            src: templateClonador2,
            alt: "Editor de Página Clonada do TrustPage — scripts do head e retenção",
            caption: "Scripts de rastreamento e Back Redirect",
          },
        ]}
        bgClass="bg-muted/30"
      />

      {/* CTA final */}
      <div className="py-10 sm:py-14 bg-background text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-lg sm:text-xl font-bold text-foreground mb-2">
            Tudo isso em uma única plataforma. 🚀
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Comece grátis e desbloqueie templates avançados quando estiver pronto.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gradient-button font-bold px-8 group">
              Criar Minha Página Grátis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default TemplateShowcaseSections;
