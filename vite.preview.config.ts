import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const previewFile = (file: string) => fileURLToPath(new URL(`./src/preview/${file}`, import.meta.url));
const policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://upload.wikimedia.org data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'self'";

function clientPreview(): Plugin {
  return {
    name: 'isolated-client-preview',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, nofollow, noarchive" />')
          .replace(/<link rel="canonical"[^>]*>/, '')
          .replace(/<meta property="(?:og|twitter):url"[^>]*>/g, '')
          .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
          .replace(/<script src="https:\/\/unpkg.com\/intasend[^>]*><\/script>/, '')
          .replaceAll('href="/vite.svg"', 'href="/topeheights.jpeg"')
          .replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${policy}" />`);
      },
    },
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        const forbidden = Object.keys(output.modules).some((id) => /node_modules\/(?:@firebase|firebase)\//.test(id.replaceAll('\\', '/')) || /src\/(?:services\/(?:firebase|orderService|intasendService|courseService)|config\/intasendConfig|context\/AuthContext)\.tsx?$/.test(id.replaceAll('\\', '/')));
        if (forbidden || /ISSecretKey_|ISPubKey_|AIza[\w-]{30,}/.test(output.code)) this.error('Preview isolation check failed: live service or credential found. No preview should be shared.');
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: 'User-agent: *\nDisallow: /\n' });
      this.emitFile({ type: 'asset', fileName: 'vercel.json', source: JSON.stringify({
        framework: null,
        rewrites: [{ source: '/(.*)', destination: '/index.html' }],
        headers: [{ source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }, { key: 'Content-Security-Policy', value: policy }] }],
      }, null, 2) });
    },
  };
}

export default defineConfig({
  plugins: [react(), clientPreview()],
  resolve: { alias: [
    { find: /^.*\/context\/AuthContext(?:\.tsx)?$/, replacement: previewFile('AuthProvider.tsx') },
    { find: /^.*\/components\/LoginModal(?:\.tsx)?$|^\.\/LoginModal$/, replacement: previewFile('LoginModal.tsx') },
    { find: /^.*\/services\/(?:courseService|productService)(?:\.ts)?$/, replacement: previewFile('catalogue.ts') },
    { find: /^.*\/services\/contentService(?:\.ts)?$/, replacement: previewFile('content.ts') },
    { find: /^.*\/(?:services\/(?:orderService|intasendService)|config\/intasendConfig)(?:\.ts)?$/, replacement: previewFile('payments.ts') },
    { find: /^.*\/services\/chatbotService(?:\.ts)?$/, replacement: previewFile('chatbot.ts') },
  ] },
  build: { outDir: 'preview-dist', sourcemap: false },
});
