import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import FacebookPixelTracker from "./components/FacebookPixelTracker";
import { Skeleton } from "@/components/ui/skeleton";

// Critical pages - loaded eagerly for fast initial render
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import LandingPageView from "./pages/LandingPageView";

// Lazy loaded pages - reduces initial bundle size by ~600KB
const TrustPageDashboard = lazy(() => import("./pages/TrustPageDashboard"));
const TrustPageEditor = lazy(() => import("./pages/TrustPageEditor"));
const CustomDomainPage = lazy(() => import("./pages/CustomDomainPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const OfertaPage = lazy(() => import("./pages/OfertaPage"));
const UpdatePasswordPage = lazy(() => import("./pages/UpdatePasswordPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const LeadsPage = lazy(() => import("./pages/LeadsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const AdminBlogPage = lazy(() => import("./pages/AdminBlogPage"));
const AdminMarketingPage = lazy(() => import("./pages/AdminMarketingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  </div>
);

// Lazy wrapper for consistent loading states
const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

// ALLOWLIST ESTRITA: Domínios que pertencem ao SISTEMA (dashboard, auth, etc)
// Qualquer domínio fora desta lista = domínio de CLIENTE
// tpage.com.br é usado para servir landing pages públicas (Plano Free)
const KNOWN_APP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'trustpage.app',
  'trustpageapp.com',
  'tpage.com.br',
  'lovable.app',
  'lovableproject.com',
  'trustpage-one.vercel.app',
] as const;

// Match seguro: hostname === domínio OU subdomínio direto (ex: *.lovableproject.com)
const isKnownAppDomain = (hostname: string): boolean =>
  KNOWN_APP_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));


// Rotas para domínios de CLIENTES - TUDO resolve via CustomDomainPage
const CustomDomainRoutes = () => (
  <>
    <FacebookPixelTracker />
    <Routes>
      <Route path="*" element={<LazyPage><CustomDomainPage /></LazyPage>} />
    </Routes>
  </>
);

// Rotas do SISTEMA - dashboard, auth, etc
const SystemRoutes = () => (
  <Routes>
    {/* Public Routes - Critical (loaded eagerly) */}
    <Route path="/" element={<HomePage />} />
    <Route path="/auth" element={<Auth />} />
    
    {/* Public Routes - Non-critical (lazy loaded) */}
    <Route path="/auth/update-password" element={<LazyPage><UpdatePasswordPage /></LazyPage>} />
    <Route path="/termos" element={<LazyPage><TermsPage /></LazyPage>} />
    <Route path="/privacidade" element={<LazyPage><PrivacyPage /></LazyPage>} />
    <Route path="/contato" element={<LazyPage><ContactPage /></LazyPage>} />
    <Route path="/oferta" element={<LazyPage><OfertaPage /></LazyPage>} />
    <Route path="/obrigado" element={<LazyPage><ThankYouPage /></LazyPage>} />
    <Route path="/sobre" element={<LazyPage><AboutPage /></LazyPage>} />
    
    {/* Blog Routes - Lazy loaded */}
    <Route path="/blog" element={<LazyPage><BlogPage /></LazyPage>} />
    <Route path="/blog/:slug" element={<LazyPage><BlogPostPage /></LazyPage>} />
    
    {/* Protected Routes - All lazy loaded */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <LazyPage><TrustPageDashboard /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <LazyPage><SettingsPage /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/subscription" element={
      <ProtectedRoute>
        <LazyPage><SubscriptionPage /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/payment-success" element={
      <ProtectedRoute>
        <LazyPage><PaymentSuccessPage /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/help" element={
      <ProtectedRoute>
        <LazyPage><HelpPage /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/admin" element={
      <ProtectedRoute>
        <LazyPage><AdminPage /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/leads" element={
      <ProtectedRoute>
        <LazyPage><LeadsPage /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/admin/blog" element={
      <ProtectedRoute>
        <LazyPage><AdminBlogPage /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/admin/marketing" element={
      <ProtectedRoute>
        <LazyPage><AdminMarketingPage /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/new" element={
      <ProtectedRoute>
        <LazyPage><TrustPageEditor /></LazyPage>
      </ProtectedRoute>
    } />
    <Route path="/edit/:id" element={
      <ProtectedRoute>
        <LazyPage><TrustPageEditor /></LazyPage>
      </ProtectedRoute>
    } />

    {/* Landing pages públicas - DEVE vir DEPOIS das rotas específicas */}
    <Route path="/p/:slug" element={<LandingPageView />} />
    <Route path="/:slug" element={<LandingPageView />} />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// App principal com separação RÍGIDA entre Sistema e Cliente
const App = () => {
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  // Rotas do SISTEMA que NUNCA podem depender do domínio (ex: /oferta, /obrigado, auth)
  // Isso evita 404 caso alguém acesse essas rotas em um domínio customizado.
  const FORCE_SYSTEM_PREFIXES = [
    "/admin",
    "/auth",
    "/blog",
    "/dashboard",
    "/leads",
    "/settings",
    "/subscription",
    "/payment-success",
    "/help",
    "/new",
    "/edit",
    "/oferta",
    "/obrigado",
    "/sobre",
    "/termos",
    "/privacidade",
    "/contato",
  ];

  const forceSystemRoutes = FORCE_SYSTEM_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const customDomain = !isKnownAppDomain(hostname);

  // Debug opcional: adicione ?tp_debug=1 na URL
  if (new URLSearchParams(window.location.search).has('tp_debug')) {
    console.log('[DomainRouting]', {
      hostname,
      customDomain,
      forceSystemRoutes,
      pathname: window.location.pathname,
    });
  }

  // Se é domínio de cliente, renderiza APENAS as rotas públicas,
  // EXCETO quando a rota é do SISTEMA (forçada) como /oferta e /obrigado.
  if (customDomain && !forceSystemRoutes) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CustomDomainRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  // Sistema completo com todos os providers
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FacebookPixelTracker />
          <AuthProvider>
            <SystemRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
