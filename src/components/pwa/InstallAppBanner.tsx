import { useState, useEffect } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const InstallAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show banner for iOS after a delay
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe animate-slide-up">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-3d p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">
                Instale o TrustPage
              </p>
              <p className="text-xs text-muted-foreground">
                Para uma experiência melhor
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                className="gradient-button text-primary-foreground"
                onClick={handleInstallClick}
              >
                Instalar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              Instalar TrustPage
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <p className="text-center text-sm text-muted-foreground">
              Siga os passos abaixo para adicionar o TrustPage à sua tela inicial:
            </p>

            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  Toque no ícone de Compartilhar
                </p>
                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Share className="w-4 h-4" />
                  </div>
                  <span className="text-xs">(Quadrado com seta para cima)</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  Role para baixo e toque em
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <Plus className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Adicionar à Tela de Início</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  Confirme tocando em "Adicionar"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O TrustPage aparecerá na sua tela inicial
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full gradient-button text-primary-foreground"
            onClick={() => {
              setShowIOSModal(false);
              handleDismiss();
            }}
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallAppBanner;
