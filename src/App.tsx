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
import useCustomDomain from "./hooks/useCustomDomain";

const queryClient = new QueryClient();

// Known app domains that should use standard routing
const KNOWN_APP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'trustpage.app',
  'lovable.app',
  'lovableproject.com',
];

const isCustomDomain = () => {
  const hostname = window.location.hostname;
  return !KNOWN_APP_DOMAINS.some(domain => hostname.includes(domain));
};

const AppRoutes = () => {
  // If it's a custom domain, use custom domain routing
  if (isCustomDomain()) {
    return (
      <Routes>
        {/* Custom domain serves landing pages directly */}
        <Route path="/" element={<CustomDomainPage />} />
        <Route path="/:slug" element={<CustomDomainPage />} />
        <Route path="*" element={<CustomDomainPage />} />
      </Routes>
    );
  }

  // Standard app routing
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/p/:slug" element={<LandingPageView />} />
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
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
