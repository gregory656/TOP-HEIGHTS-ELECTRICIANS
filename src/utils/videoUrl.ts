export function videoUrl(input: string): string {
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return '';
    let id = '';
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) id = url.pathname === '/watch' ? url.searchParams.get('v') || '' : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})\/?$/)?.[1] || '';
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    if (/^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const match = url.pathname.match(/^\/(?:video\/)?(\d{6,12})\/?$/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch { /* Invalid URL: never interpolate it into an iframe. */ }
  return '';
}
