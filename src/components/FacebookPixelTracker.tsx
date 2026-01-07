import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

/**
 * Componente que rastreia PageView em cada mudança de rota (SPA)
 * Deve ser renderizado dentro do BrowserRouter
 */
const FacebookPixelTracker = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Pula o primeiro render porque o PageView já foi disparado no index.html
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Dispara PageView em cada mudança de rota
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return null;
};

export default FacebookPixelTracker;
