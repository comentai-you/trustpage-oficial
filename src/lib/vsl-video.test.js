import { expect, test } from 'bun:test';
import { getVslEmbedUrl } from './vsl-video';

test('YouTube exposes sound controls and requests unmuted inline playback', () => {
  const result = getVslEmbedUrl('https://youtu.be/dQw4w9WgXcQ', true, 'https://tpage.com.br');
  expect(result).not.toBeNull();
  const url = new URL(result ?? '');
  expect(url.searchParams.get('controls')).toBe('1');
  expect(url.searchParams.get('mute')).toBe('0');
  expect(url.searchParams.get('playsinline')).toBe('1');
  expect(url.searchParams.get('autoplay')).toBe('1');
});

test('Vimeo exposes sound controls and preserves unlisted video access', () => {
  const result = getVslEmbedUrl('https://player.vimeo.com/video/123456789?h=abc123&muted=1', true, 'https://tpage.com.br');
  const url = new URL(result ?? '');
  expect(url.searchParams.get('muted')).toBe('0');
  expect(url.searchParams.get('controls')).toBe('1');
  expect(url.searchParams.get('h')).toBe('abc123');
});

test('playback is not requested before visitor taps play', () => {
  const result = getVslEmbedUrl('https://vimeo.com/123456789', false, 'https://tpage.com.br');
  expect(new URL(result ?? '').searchParams.get('autoplay')).toBe('0');
});

test('lookalike video domains are rejected', () => {
  expect(getVslEmbedUrl('https://youtube.com.attacker.example/watch?v=dQw4w9WgXcQ', true, 'https://tpage.com.br')).toBeNull();
});