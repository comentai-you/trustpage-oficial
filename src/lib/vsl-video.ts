export function getVslVideoInfo(value: string) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(host)) {
      const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      return id && /^[\w-]{11}$/.test(id) ? { type: 'youtube' as const, id } : null;
    }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
      const match = url.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([\w]+))?\/?$/);
      return match ? { type: 'vimeo' as const, id: match[1], hash: url.searchParams.get('h') || match[2] } : null;
    }
    return null;
  } catch { return null; }
}

export function getVslEmbedUrl(value: string, autoplay: boolean, origin: string) {
  const info = getVslVideoInfo(value);
  if (!info) return null;
  const params = new URLSearchParams({ autoplay: autoplay ? '1' : '0', controls: '1', playsinline: '1' });
  if (info.type === 'youtube') {
    params.set('mute', '0');
    params.set('enablejsapi', '1');
    params.set('origin', origin);
    params.set('rel', '0');
    return `https://www.youtube.com/embed/${info.id}?${params}`;
  }
  params.set('muted', '0');
  params.set('title', '0');
  params.set('byline', '0');
  params.set('portrait', '0');
  params.set('api', '1');
  if (info.hash) params.set('h', info.hash);
  return `https://player.vimeo.com/video/${info.id}?${params}`;
}