import { Link } from "react-router-dom";
import { Shield, Lock, Clock, Headphones } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      {/* Trust Badges */}
      <div className="border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Compra Segura</p>
                <p className="text-xs text-muted-foreground">100% Protegido</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sistema Escrow</p>
                <p className="text-xs text-muted-foreground">Pagamento Garantido</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Entrega Rápida</p>
                <p className="text-xs text-muted-foreground">Em minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Suporte 24h</p>
                <p className="text-xs text-muted-foreground">Sempre disponível</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TM</span>
              </div>
              <span className="text-lg font-bold text-foreground">TrustMarket</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O marketplace mais seguro para negociação de ativos digitais no Brasil.
            </p>
          </div>

          {/* Sobre */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Sobre</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Segurança
                </Link>
              </li>
            </ul>
          </div>

          {/* Acesso Rápido */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Acesso Rápido</h4>
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
              <li>
                <Link to="/create-listing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Anunciar
                </Link>
              </li>
            </ul>
          </div>

          {/* Como Funciona */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Como Funciona</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/guide/buyers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Guia do Comprador
                </Link>
              </li>
              <li>
                <Link to="/guide/sellers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Guia do Vendedor
                </Link>
              </li>
              <li>
                <Link to="/escrow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sistema Escrow
                </Link>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Institucional</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
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
                  Suporte
                </a>
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
              Pagamentos via PIX
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              Sistema Escrow Integrado
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
