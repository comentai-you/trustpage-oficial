// Domain configuration
// tpage.com.br is used for public landing pages (Free plan users)
// trustpageapp.com is the main app domain (dashboard, editor, settings, etc.)

export const PUBLIC_PAGES_DOMAIN = 'tpage.com.br';
export const PUBLIC_PAGES_BASE_URL = `https://${PUBLIC_PAGES_DOMAIN}`;

// Helper function to generate the public page URL
const LEGAL_PAGE_SLUGS = new Set(['politica-de-privacidade', 'termos-de-uso', 'contato']);

export const getPublicPageUrl = (
  slug: string,
  customDomain?: string | null,
  ownerId?: string | null,
): string => {
  const normalizedSlug = String(slug).toLowerCase();

  // Custom domains: the domain itself identifies the owner, so we don't need ?owner=
  if (customDomain) {
    const normalizedDomain = customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return `https://${normalizedDomain}/p/${normalizedSlug}`;
  }

  // System domain: legal pages MUST include ownerId to avoid 404 and cross-user leakage
  if (ownerId && LEGAL_PAGE_SLUGS.has(normalizedSlug)) {
    return `${PUBLIC_PAGES_BASE_URL}/p/${normalizedSlug}?owner=${encodeURIComponent(ownerId)}`;
  }

  return `${PUBLIC_PAGES_BASE_URL}/p/${normalizedSlug}`;
};
