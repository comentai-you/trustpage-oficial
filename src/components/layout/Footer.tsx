import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TM</span>
              </div>
              <span className="text-xl font-bold gradient-text">TrustMarket</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O marketplace mais seguro para negociação de ativos digitais no Brasil.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categorias</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link to="/social-media" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Social Media
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Serviços Digitais
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://t.me/trustmarket_suporte" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Telegram
                </a>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Conta</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Entrar / Cadastrar
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Minha Carteira
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Configurações
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Criar Anúncio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 TrustMarket. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Pagamentos via PIX • Sistema Escrow Integrado
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
