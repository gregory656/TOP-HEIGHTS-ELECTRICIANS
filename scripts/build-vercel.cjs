const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

function vercelBuildEnvironment(config) {
  const production = config.VERCEL_ENV === 'production';
  const projectId = production ? 'top-heights-electricals' : 'top-heights-staging-408995';
  if (config.VITE_FIREBASE_PROJECT_ID !== projectId || config.COMMERCE_ENVIRONMENT !== (production ? 'production' : 'staging')) {
    throw Error('Configure separate Firebase and commerce environments for Production and Preview.');
  }
  if (config.VITE_USE_FIREBASE_EMULATORS !== 'false') throw Error('Hosted builds cannot use emulators.');
  const origin = !production && config.VERCEL_URL ? `https://${config.VERCEL_URL}` : config.STOREFRONT_ORIGIN;
  const url = new URL(origin);
  if (url.origin !== origin || url.protocol !== 'https:') throw Error('Configure the exact HTTPS storefront origin.');
  if (production && !['topheightselectricals.com', 'www.topheightselectricals.com'].includes(url.hostname)) throw Error('Unexpected production domain.');
  return { ...config, STOREFRONT_ORIGIN: origin, VITE_SITE_URL: origin, VITE_COMMERCE_API_URL: origin + '/api', VITE_INDEXABLE: production ? 'true' : 'false' };
}

async function main() {
  const { loadEnv } = await import('vite');
  const mode = process.env.VERCEL_ENV === 'production' ? 'production' : 'staging';
  const env = vercelBuildEnvironment({ ...loadEnv(mode, root, 'VITE_'), ...process.env });
  for (const args of [
    ['node_modules/typescript/bin/tsc', '-b'],
    ['node_modules/typescript/bin/tsc', '-p', 'backend/functions/tsconfig.json'],
    ['node_modules/vite/bin/vite.js', 'build', '--mode', mode],
    ['scripts/prepare-hosting.cjs'],
  ]) {
    const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
    if (result.status !== 0) throw Error('Vercel build failed.');
  }
  console.log('Vercel frontend and backend built. Nothing deployed.');
}
module.exports = { vercelBuildEnvironment };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
