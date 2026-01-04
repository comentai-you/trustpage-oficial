import { useState, useEffect } from "react";

// Manter consistente com src/App.tsx
const KNOWN_APP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'trustpage.app',
  'trustpageapp.com',
  'lovable.app',
  'lovableproject.com',
  'trustpage-one.vercel.app',
] as const;

const isKnownAppDomain = (hostname: string): boolean =>
  KNOWN_APP_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

export const useCustomDomain = () => {
  const [isCustomDomain, setIsCustomDomain] = useState<boolean | null>(null);
  const [hostname, setHostname] = useState<string>('');

  useEffect(() => {
    const currentHostname = window.location.hostname.toLowerCase();
    setHostname(currentHostname);
    setIsCustomDomain(!isKnownAppDomain(currentHostname));
  }, []);

  return { isCustomDomain, hostname };
};

export default useCustomDomain;

