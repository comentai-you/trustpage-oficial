import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

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

    // Se cair em 404 numa rota CRÍTICA do sistema, quase sempre é cache/PWA servindo bundle antigo.
    // Forçamos um reset (via ?tp_force_update=1) e recarregamos UMA vez.
    const hostname = window.location.hostname.toLowerCase();
    const isCritical = CRITICAL_STATIC_ROUTES.includes(pathname);
    const url = new URL(window.location.href);
    const alreadyTrying = url.searchParams.has("tp_force_update");

    if (isSystemHostname(hostname) && isCritical && !alreadyTrying) {
      url.searchParams.set("tp_force_update", "1");
      window.location.replace(url.toString());
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
