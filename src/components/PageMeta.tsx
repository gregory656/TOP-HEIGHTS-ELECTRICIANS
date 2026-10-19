import { useEffect } from 'react';

export default function PageMeta({ title, description, path, image = '/topeheights.jpeg', article = false, noindex = false }: {
  title: string; description: string; path: string; image?: string; article?: boolean; noindex?: boolean;
}) {
  useEffect(() => {
    const origin = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
    const url = origin + path;
    const changes: (() => void)[] = [];
    const previousTitle = document.title;
    document.title = `${title} | Top Heights Electricals`;
    const set = (selector: string, attribute: string, value: string, create: () => HTMLElement) => {
      let element = document.head.querySelector<HTMLElement>(selector);
      const existed = Boolean(element);
      if (!element) { element = create(); document.head.appendChild(element); }
      const previous = element.getAttribute(attribute);
      element.setAttribute(attribute, value);
      const target = element;
      changes.push(() => { if (!existed) target.remove(); else if (previous !== null) target.setAttribute(attribute, previous); else target.removeAttribute(attribute); });
    };
    const meta = (key: string, value: string) => {
      const attr = key.startsWith('og:') ? 'property' : 'name';
      set(`meta[${attr}="${key}"]`, 'content', value, () => { const el = document.createElement('meta'); el.setAttribute(attr, key); return el; });
    };
    meta('description', description);
    meta('robots', noindex || import.meta.env.VITE_INDEXABLE !== 'true' ? 'noindex, nofollow' : 'index, follow');
    meta('og:title', document.title); meta('og:description', description); meta('og:url', url);
    meta('og:type', article ? 'article' : 'website'); meta('og:image', new URL(image || '/topeheights.jpeg', origin).href);
    meta('twitter:card', 'summary_large_image'); meta('twitter:title', document.title); meta('twitter:description', description);
    meta('twitter:image', new URL(image || '/topeheights.jpeg', origin).href);
    set('link[rel="canonical"]', 'href', url, () => { const el = document.createElement('link'); el.rel = 'canonical'; return el; });
    return () => { document.title = previousTitle; changes.reverse().forEach(restore => restore()); };
  }, [title, description, path, image, article, noindex]);
  return null;
}
