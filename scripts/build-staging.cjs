const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const projectId = 'top-heights-staging-408995';

(async () => {
  const { loadEnv } = await import('vite');
  const config = loadEnv('staging', root, 'VITE_');
  if (config.VITE_FIREBASE_PROJECT_ID !== projectId || config.VITE_USE_FIREBASE_EMULATORS !== 'false') {
    throw Error('Configure .env.staging.local for the isolated cloud staging project first.');
  }
  // Hosting is chosen separately. Do not silently enable services requiring billing.
  const origin = process.env.STAGING_SITE_URL;
  const api = process.env.STAGING_API_URL;
  if (!origin || !api) throw Error('Set STAGING_SITE_URL and STAGING_API_URL to your configured HTTPS staging endpoints. This command does not provision hosting.');
  for (const value of [origin, api]) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || ['localhost', '127.0.0.1'].includes(url.hostname)) {
      throw Error('Hosted staging endpoints must be HTTPS URLs without credentials, query parameters or fragments.');
    }
  }
  const env = { ...process.env, ...config, VITE_SITE_URL: origin, VITE_COMMERCE_API_URL: api,
    VITE_USE_FIREBASE_EMULATORS: 'false', VITE_INDEXABLE: 'false',
    VITE_IMAGE_UPLOADS_ENABLED: config.VITE_IMAGE_UPLOADS_ENABLED || 'false' };
  for (const args of [['node_modules/typescript/bin/tsc', '-b'], ['node_modules/typescript/bin/tsc', '-p', 'backend/functions/tsconfig.json'], ['node_modules/vite/bin/vite.js', 'build', '--mode', 'staging'], ['scripts/prepare-hosting.cjs']]) {
    const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
    if (result.status !== 0) throw Error('Staging build failed.');
  }
  fs.mkdirSync(path.join(root, '.local'), { recursive: true });
  fs.writeFileSync(path.join(root, '.local/staging-build.json'), JSON.stringify({ projectId, origin, api, indexable: false, builtAt: new Date().toISOString() }, null, 2));
  console.log('Built the staging frontend and API template. Nothing has been deployed.');
  console.log('Hosting, image uploads and IntaSend must be configured and tested separately.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
