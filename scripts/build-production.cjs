const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const projectId = 'top-heights-electricals';

(async () => {
  const { loadEnv } = await import('vite');
  const config = loadEnv('production', root, 'VITE_');
  if (config.VITE_FIREBASE_PROJECT_ID !== projectId || config.VITE_USE_FIREBASE_EMULATORS !== 'false') {
    throw Error('Configure .env.production.local for the isolated cloud production project first.');
  }
  // Hosting is chosen separately. Do not silently enable services requiring billing.
  const origin = process.env.PRODUCTION_SITE_URL;
  const api = process.env.PRODUCTION_API_URL;
  if (!origin || !api) throw Error('Set PRODUCTION_SITE_URL and PRODUCTION_API_URL to your configured HTTPS production endpoints. This command does not provision hosting.');
  if (new URL(origin).origin !== origin || !['topheightselectricals.com', 'www.topheightselectricals.com'].includes(new URL(origin).hostname) || new URL(api).origin !== origin) throw Error('Production must use the approved live domain and its own API.');
  for (const value of [origin, api]) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || ['localhost', '127.0.0.1'].includes(url.hostname)) {
      throw Error('Hosted production endpoints must be HTTPS URLs without credentials, query parameters or fragments.');
    }
  }
  const env = { ...process.env, ...config, VITE_SITE_URL: origin, VITE_COMMERCE_API_URL: api,
    VITE_USE_FIREBASE_EMULATORS: 'false', VITE_INDEXABLE: 'true',
    VITE_IMAGE_UPLOADS_ENABLED: config.VITE_IMAGE_UPLOADS_ENABLED || 'false' };
  for (const args of [['node_modules/typescript/bin/tsc', '-b'], ['node_modules/typescript/bin/tsc', '-p', 'backend/functions/tsconfig.json'], ['node_modules/vite/bin/vite.js', 'build', '--mode', 'production'], ['scripts/prepare-hosting.cjs']]) {
    const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
    if (result.status !== 0) throw Error('Production build failed.');
  }
  fs.mkdirSync(path.join(root, '.local'), { recursive: true });
  fs.writeFileSync(path.join(root, '.local/production-build.json'), JSON.stringify({ projectId, origin, api, indexable: true, builtAt: new Date().toISOString() }, null, 2));
  console.log('Built the production frontend and API template. Nothing has been deployed.');
  console.log('Hosting, image uploads and IntaSend must be configured and tested separately.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
