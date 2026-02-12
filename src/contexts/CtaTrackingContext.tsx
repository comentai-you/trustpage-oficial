import { createContext, useContext, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CtaTrackingContextType {
  trackCtaClick: () => void;
}

const CtaTrackingContext = createContext<CtaTrackingContextType | undefined>(undefined);

export const useCtaTracking = (): CtaTrackingContextType => {
  const context = useContext(CtaTrackingContext);
  if (!context) {
    return { trackCtaClick: () => {} }; // No-op in editor/preview
  }
  return context;
};

interface CtaTrackingProviderProps {
  pageId: string | null;
  pageType?: 'landing' | 'cloned' | 'quiz';
  children: ReactNode;
}

export const CtaTrackingProvider = ({ pageId, pageType = 'landing', children }: CtaTrackingProviderProps) => {
  const lastClick = useRef(0);

  const trackCtaClick = useCallback(() => {
    if (!pageId) return;

    const now = Date.now();
    if (now - lastClick.current < 2000) return;
    lastClick.current = now;

    supabase.functions.invoke("track-cta-click", {
      body: { page_id: pageId, page_type: pageType },
    }).catch(() => {});
  }, [pageId, pageType]);

  return (
    <CtaTrackingContext.Provider value={{ trackCtaClick }}>
      {children}
    </CtaTrackingContext.Provider>
  );
};
