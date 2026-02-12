import { useEffect } from "react";

/**
 * Implements back-button hijacking for published pages.
 * Uses pushState + popstate to redirect visitors when they press "Back".
 * 
 * IMPORTANT: Only activate on published pages, NOT inside the editor.
 */
export function useBackRedirect(enabled: boolean, redirectUrl: string) {
  useEffect(() => {
    if (!enabled || !redirectUrl) return;

    let activated = false;

    const activate = () => {
      if (activated) return;
      activated = true;
      // Push a duplicate state so "back" triggers popstate instead of leaving
      window.history.pushState(null, "", window.location.href);
      window.history.pushState(null, "", window.location.href);
    };

    const handlePopState = () => {
      if (!activated) return;
      // Redirect to the configured URL
      window.location.href = redirectUrl;
    };

    // Activate on first user interaction (click or scroll) to respect browser policies
    const onInteraction = () => {
      activate();
      window.removeEventListener("click", onInteraction);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
    };

    window.addEventListener("click", onInteraction, { once: false, passive: true });
    window.addEventListener("scroll", onInteraction, { once: false, passive: true });
    window.addEventListener("touchstart", onInteraction, { once: false, passive: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("click", onInteraction);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled, redirectUrl]);
}
