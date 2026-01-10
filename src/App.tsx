import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import FacebookPixelTracker from "./components/FacebookPixelTracker";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import TrustPageDashboard from "./pages/TrustPageDashboard";
import TrustPageEditor from "./pages/TrustPageEditor";
import LandingPageView from "./pages/LandingPageView";
import CustomDomainPage from "./pages/CustomDomainPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ContactPage from "./pages/ContactPage";
import SettingsPage from "./pages/SettingsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import HelpPage from "./pages/HelpPage";
import OfertaPage from "./pages/OfertaPage";

const queryClient = new QueryClient();

// ALLOWLIST ESTRITA: Domínios que pertencem ao SISTEMA (dashboard, auth, etc)
// Qualquer domínio fora desta lista = domínio de CLIENTE
const KNOWN_APP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'trustpage.app',
  'trustpageapp.com',
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
      <Route path="*" element={<CustomDomainPage />} />
    </Routes>
  </>
);

// Rotas do SISTEMA - dashboard, auth, etc
const SystemRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/auth" element={<Auth />} />

    {/* Landing pages públicas (suporta URL limpa e legado /p/:slug) */}
    <Route path="/p/:slug" element={<LandingPageView />} />
    <Route path="/:slug" element={<LandingPageView />} />

    <Route path="/termos" element={<TermsPage />} />
    <Route path="/privacidade" element={<PrivacyPage />} />
    <Route path="/contato" element={<ContactPage />} />
    <Route path="/oferta" element={<OfertaPage />} />
    
    {/* Protected Routes */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <TrustPageDashboard />
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    } />
    <Route path="/subscription" element={
      <ProtectedRoute>
        <SubscriptionPage />
      </ProtectedRoute>
    } />
    <Route path="/payment-success" element={
      <ProtectedRoute>
        <PaymentSuccessPage />
      </ProtectedRoute>
    } />
    <Route path="/help" element={
      <ProtectedRoute>
        <HelpPage />
      </ProtectedRoute>
    } />
    <Route path="/new" element={
      <ProtectedRoute>
        <TrustPageEditor />
      </ProtectedRoute>
    } />
    <Route path="/edit/:id" element={
      <ProtectedRoute>
        <TrustPageEditor />
      </ProtectedRoute>
    } />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// App principal com separação RÍGIDA entre Sistema e Cliente
const App = () => {
  const hostname = window.location.hostname.toLowerCase();
  const customDomain = !isKnownAppDomain(hostname);

  // Debug opcional: adicione ?tp_debug=1 na URL
  if (new URLSearchParams(window.location.search).has('tp_debug')) {
    console.log('[DomainRouting]', {
      hostname,
      customDomain,
      pathname: window.location.pathname,
    });
  }

  // Se é domínio de cliente, renderiza APENAS as rotas públicas
  if (customDomain) {
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
