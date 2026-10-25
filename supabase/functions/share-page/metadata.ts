export interface SharePage {
  slug: string;
  headline?: string | null;
  page_name?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  image_url?: string | null;
  content?: { share_image_url?: string } | null;
}

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);

export function safeImageUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function renderSharePage(page: SharePage, canonical: string) {
  const title = escapeHtml(page.headline || page.page_name || page.slug);
  const description = escapeHtml(page.description || '');
  const url = escapeHtml(canonical);
  const image = safeImageUrl(page.content?.share_image_url) || safeImageUrl(page.cover_image_url) || safeImageUrl(page.image_url);
  const imageTags = image ? `<meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:alt" content="${title}"><meta name="twitter:image" content="${escapeHtml(image)}">` : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}"><meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}">${imageTags}</head><body><h1>${title}</h1><p>${description}</p>${image ? `<img src="${escapeHtml(image)}" alt="${title}">` : ''}<a href="${url}">Abrir página</a></body></html>`;
}