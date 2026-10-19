import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const indexable = env.VITE_INDEXABLE === 'true';
  const origin = (env.VITE_SITE_URL || '').replace(/\/$/, '');
  return {
    plugins: [react(), {
      name: 'launch-indexing',
      transformIndexHtml(html: string) {
        return html.replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${indexable ? 'index, follow' : 'noindex, nofollow'}" />`)
          .replaceAll('href="/vite.svg"', 'href="/topeheights.jpeg"');
      },
      generateBundle() {
        if (indexable && !origin.startsWith('https://')) this.error('Set VITE_SITE_URL to the HTTPS production origin before enabling indexing.');
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: indexable ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /profile\nDisallow: /student-dashboard\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n' });
      },
    }],
  };
})
