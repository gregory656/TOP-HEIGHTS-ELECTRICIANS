const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const env = { ...process.env };
const java = 'C:\\Program Files\\JetBrains\\WebStorm 2025.3.4\\jbr\\bin';
if (process.platform === 'win32' && fs.existsSync(path.join(java, 'java.exe'))) {
  const key = Object.keys(env).find(k => k.toLowerCase() === 'path') || 'PATH';
  env[key] = `${java};${env[key] || ''}`;
}
const build = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'backend/functions/tsconfig.json'], { cwd: root, env, stdio: 'inherit', windowsHide: true });
if (build.status !== 0) process.exit(build.status || 1);
const result = spawnSync(process.execPath, ['backend/functions/node_modules/firebase-tools/lib/bin/firebase.js', 'emulators:exec', '--config', 'firebase.test.json', '--project', 'demo-topheights-tests', '--only', 'firestore,storage', 'node --test --test-concurrency=1 backend/functions/test/commerce.test.cjs backend/functions/test/intasend.test.cjs backend/functions/test/media.test.cjs backend/functions/test/free-hosting.test.cjs backend/functions/test/vercel.test.cjs backend/functions/test/videos.test.cjs tests/contentEditing.test.cjs tests/privacyPreferences.test.cjs tests/publicSeo.test.cjs tests/orderModel.test.cjs tests/orderCheckout.test.cjs tests/userProfile.test.cjs'], { cwd: root, env, stdio: 'inherit', windowsHide: true });
process.exit(result.status === 0 ? 0 : 1);
