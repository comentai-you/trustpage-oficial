import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to track CTA button clicks on published pages.
 * Debounces to avoid duplicate tracking on rapid clicks.
 */
export function useTrackCtaClick(pageId: string | undefined, pageType: 'landing' | 'cloned' | 'quiz' = 'landing') {
  const lastClick = useRef(0);

  const trackClick = useCallback(() => {
    if (!pageId) return;

    // Debounce: ignore clicks within 2 seconds
    const now = Date.now();
    if (now - lastClick.current < 2000) return;
    lastClick.current = now;

    // Fire and forget - don't block the user
    supabase.functions.invoke("track-cta-click", {
      body: { page_id: pageId, page_type: pageType },
    }).catch(() => {
      // Silently fail - tracking should never break UX
    });
  }, [pageId, pageType]);

  return trackClick;
}
