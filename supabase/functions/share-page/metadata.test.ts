import { expect, test } from 'bun:test';
import { renderSharePage, safeImageUrl } from './metadata';

test('share image overrides the page cover and never uses a Lovable fallback', () => {
  const html = renderSharePage({ slug: 'vsl', headline: 'Minha oferta', cover_image_url: 'https://example.com/cover.jpg', content: { share_image_url: 'https://example.com/share.jpg' } }, 'https://tpage.com.br/p/vsl');
  expect(html).toContain('property="og:image" content="https://example.com/share.jpg"');
  expect(html).not.toContain('https://example.com/cover.jpg');
  expect(html).not.toContain('lovable.dev');
});

test('missing image does not invent a brand image', () => {
  expect(renderSharePage({ slug: 'vsl' }, 'https://tpage.com.br/p/vsl')).not.toContain('property="og:image"');
});

test('unsafe image URL and injected page content cannot produce executable HTML', () => {
  expect(safeImageUrl('javascript:alert(1)')).toBeNull();
  const html = renderSharePage({ slug: 'vsl', headline: '<script>alert(1)</script>', content: { share_image_url: 'https://example.com/image.jpg?x=" onerror="alert(1)' } }, 'https://tpage.com.br/p/vsl');
  expect(html).not.toContain('<script>');
  expect(html).not.toContain(' onerror="');
});