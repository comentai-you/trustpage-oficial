import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
  'vercel.app',
  'trustpage-one.vercel.app',
] as const;

// Verifica se o hostname atual é um domínio de cliente (NÃO está na allowlist)
const isCustomDomain = (): boolean => {
  const hostname = window.location.hostname.toLowerCase();
  return !KNOWN_APP_DOMAINS.some(domain => hostname.includes(domain));
};

// Rotas para domínios de CLIENTES - apenas páginas públicas
const CustomDomainRoutes = () => (
  <Routes>
    {/* Home do domínio customizado resolve a página padrão via edge function */}
    <Route path="/" element={<CustomDomainPage />} />

    {/* Páginas públicas (suporta URL limpa e legado /p/:slug) */}
    <Route path="/p/:slug" element={<LandingPageView />} />
    <Route path="/:slug" element={<LandingPageView />} />

    {/* Fallback para qualquer coisa (ex: /foo/bar) */}
    <Route path="*" element={<CustomDomainPage />} />
  </Routes>
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
  // Se é domínio de cliente, renderiza APENAS as rotas públicas (leve, sem providers desnecessários)
  if (isCustomDomain()) {
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
          <AuthProvider>
            <SystemRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
