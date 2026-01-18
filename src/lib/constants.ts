// Domain configuration
// tpage.com.br is used for public landing pages (Free plan users)
// trustpageapp.com is the main app domain (dashboard, editor, settings, etc.)

export const PUBLIC_PAGES_DOMAIN = 'tpage.com.br';
export const PUBLIC_PAGES_BASE_URL = `https://${PUBLIC_PAGES_DOMAIN}`;

// Helper function to generate the public page URL
export const getPublicPageUrl = (slug: string, customDomain?: string | null): string => {
  if (customDomain) {
    const normalizedDomain = customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return `https://${normalizedDomain}/p/${slug}`;
  }
  return `${PUBLIC_PAGES_BASE_URL}/p/${slug}`;
};
