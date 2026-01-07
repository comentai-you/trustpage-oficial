declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

/**
 * Dispara evento de conversão CompleteRegistration
 * Deve ser chamado apenas uma vez por usuário novo
 */
export const trackCompleteRegistration = () => {
  if (typeof window.fbq === "function") {
    window.fbq("track", "CompleteRegistration");
  }
};
