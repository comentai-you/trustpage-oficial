import { useState, useEffect } from "react";

const KNOWN_APP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'trustpage.app',
  'lovable.app',
  'lovableproject.com',
  'preview--',  // Lovable preview domains
];

export const useCustomDomain = () => {
  const [isCustomDomain, setIsCustomDomain] = useState<boolean | null>(null);
  const [hostname, setHostname] = useState<string>('');

  useEffect(() => {
    const currentHostname = window.location.hostname;
    setHostname(currentHostname);

    // Check if this is a known app domain
    const isKnownDomain = KNOWN_APP_DOMAINS.some(domain => 
      currentHostname.includes(domain)
    );

    setIsCustomDomain(!isKnownDomain);
  }, []);

  return { isCustomDomain, hostname };
};

export default useCustomDomain;
