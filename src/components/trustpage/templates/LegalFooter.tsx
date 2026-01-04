interface LegalFooterProps {
  textColor?: string;
  showWatermark?: boolean;
}

const LegalFooter = ({ textColor = "#FFFFFF", showWatermark = true }: LegalFooterProps) => {
  const footerLinks = [
    { label: "Políticas de Privacidade", slug: "politica-de-privacidade" },
    { label: "Termos de Uso", slug: "termos-de-uso" },
    { label: "Contato", slug: "contato" },
  ];

  // Links relativos - funcionam tanto em domínios customizados quanto no padrão
  const getLinkHref = (slug: string) => {
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