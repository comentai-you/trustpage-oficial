import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, Home, BookOpen, HelpCircle, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const CRITICAL_STATIC_ROUTES = [
  "/oferta",
  "/obrigado",
  "/auth",
  "/auth/update-password",
];

const isSystemHostname = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "trustpage.app" ||
  hostname.endsWith(".trustpage.app") ||
  hostname === "trustpageapp.com" ||
  hostname.endsWith(".trustpageapp.com") ||
  hostname === "trustpage-one.vercel.app" ||
  hostname.endsWith(".lovableproject.com") ||
  hostname.endsWith(".lovable.app") ||
  hostname.endsWith(".lovableproject.com");

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.replace(/\/+$/, "") || "/";
    console.error("404 Error: User attempted to access non-existent route:", pathname);

    const hostname = window.location.hostname.toLowerCase();
    const isCritical = CRITICAL_STATIC_ROUTES.includes(pathname);
    const url = new URL(window.location.href);
    const alreadyTrying = url.searchParams.has("tp_force_update");

    if (isSystemHostname(hostname) && isCritical && !alreadyTrying) {
      url.searchParams.set("tp_force_update", "1");
      window.location.replace(url.toString());
    }
  }, [location.pathname]);

  const suggestions = [
    {
      icon: Home,
      title: "Página Inicial",
      description: "Volte para a home e conheça o TrustPage",
      href: "/",
    },
    {
      icon: BookOpen,
      title: "Blog",
      description: "Leia artigos sobre marketing e conversão",
      href: "/blog",
    },
    {
      icon: HelpCircle,
      title: "Ajuda",
      description: "Precisa de suporte? Veja nossos tutoriais",
      href: "/contato",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">TrustPage</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-[150px] md:text-[200px] font-bold text-primary/10 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="w-12 h-12 md:w-16 md:h-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Página não encontrada
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Ops! A página que você está procurando não existe ou foi movida. 
            Mas não se preocupe, temos algumas sugestões para você:
          </p>

          {/* Suggestions Grid */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {suggestions.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Voltar para Início
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/blog">
                <BookOpen className="w-4 h-4" />
                Explorar Blog
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TrustPage. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
