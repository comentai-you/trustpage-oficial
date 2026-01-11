import useCustomDomain from "@/hooks/useCustomDomain";
import { usePageOwner } from "@/contexts/PageOwnerContext";

interface LegalFooterProps {
  textColor?: string;
  showWatermark?: boolean;
}

const LegalFooter = ({ textColor = "#FFFFFF", showWatermark = true }: LegalFooterProps) => {
  const { isCustomDomain } = useCustomDomain();
  const { ownerId } = usePageOwner();

  const footerLinks = [
    { label: "Políticas de Privacidade", slug: "politica-de-privacidade" },
    { label: "Termos de Uso", slug: "termos-de-uso" },
    { label: "Contato", slug: "contato" },
  ];

  // Gera o link correto para a página legal do MESMO DONO da página atual
  const getLinkHref = (slug: string) => {
    // Domínio customizado: usa URL limpa /slug (o resolvedor já filtra pelo dono do domínio)
    if (isCustomDomain) return `/${slug}`;
    
    // Domínio do sistema: usa /p/slug com parâmetro owner para identificar o dono
    // Isso garante que a página legal carregada seja a do mesmo usuário
    if (ownerId) {
      return `/p/${slug}?owner=${ownerId}`;
    }
    
    // Fallback sem owner (preview/editor mode)
    return `/p/${slug}`;
  };

  return (
    <footer className="w-full py-6 text-center space-y-3">
      {/* Legal Links */}
      <div className="flex items-center justify-center gap-2 flex-wrap text-xs" style={{ opacity: 0.5, color: textColor }}>
        {footerLinks.map((link, index) => (
          <span key={link.slug} className="flex items-center gap-2">
            <a
              href={getLinkHref(link.slug)}
              className="hover:opacity-80 transition-opacity underline-offset-2 hover:underline"
            >
              {link.label}
            </a>
            {index < footerLinks.length - 1 && <span>|</span>}
          </span>
        ))}
      </div>

      {/* Watermark */}
      {showWatermark && (
        <p className="text-xs font-medium tracking-wide" style={{ opacity: 0.4, color: textColor }}>
          ✨ Criado com <span className="font-bold">TrustPage</span>
        </p>
      )}
    </footer>
  );
};

export default LegalFooter;
