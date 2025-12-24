import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, User, Plus, MessageCircle, Settings } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TM</span>
            </div>
            <span className="text-xl font-bold gradient-text">TrustMarket</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/games" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Games
            </Link>
            <Link to="/social-media" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Social Media
            </Link>
            <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Serviços Digitais
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              Suporte
            </Button>
            <Link to="/wallet">
              <Button variant="outline" size="sm" className="gap-2">
                <Wallet className="w-4 h-4" />
                Carteira
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </Button>
            </Link>
            <Link to="/create-listing">
              <Button variant="gradient" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Anunciar
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="secondary" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                Entrar
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col gap-2">
              <Link 
                to="/games" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Games
              </Link>
              <Link 
                to="/social-media" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Social Media
              </Link>
              <Link 
                to="/services" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Serviços Digitais
              </Link>
              <div className="border-t border-border my-2" />
              <Link to="/wallet" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Wallet className="w-4 h-4" />
                  Carteira
                </Button>
              </Link>
              <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
              </Link>
              <Link to="/create-listing" onClick={() => setIsMenuOpen(false)}>
                <Button variant="gradient" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Anunciar
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="secondary" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  Entrar
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
