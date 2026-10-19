// One-command local testing. Nothing here connects to a live Firebase project.
const fs = require('node:fs'), path = require('node:path'), net = require('node:net');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const local = path.join(root, '.local');
fs.mkdirSync(local, { recursive: true });
const env = { ...process.env, FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9098',
  FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9198', GCLOUD_PROJECT: 'demo-topheights-commerce', SHIPPING_FEE_KES: '0', VITE_USE_FIREBASE_EMULATORS: 'true',
  VITE_COMMERCE_API_URL: 'http://127.0.0.1:5002' };
const java = 'C:\\Program Files\\JetBrains\\WebStorm 2025.3.4\\jbr\\bin';
if (process.platform === 'win32' && fs.existsSync(path.join(java, 'java.exe'))) {
  const key = Object.keys(env).find(k => k.toLowerCase() === 'path') || 'PATH';
  env[key] = `${java};${env[key] || ''}`;
}
const children = [];
function launch(name, args) {
  const log = fs.openSync(path.join(local, `${name}.log`), 'w');
  const child = spawn(process.execPath, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', log, log] });
  children.push(child); return child;
}
const isListening = port => new Promise(resolve => { const socket = net.connect(port, '127.0.0.1'); socket.once('connect', () => { socket.destroy(); resolve(true); }); socket.once('error', () => resolve(false)); });
async function ready(port) {
  for (let i = 0; i < 300; i++) { if (await isListening(port)) return; await new Promise(r => setTimeout(r, 1000)); }
  throw Error(`Port ${port} did not start. See .local/*.log.`);
}
function stop() {
  for (const child of children) {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else child.kill('SIGTERM');
  }
}
process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });
(async () => {
  for (const port of [5174, 5002, 8085, 9098, 9198]) if (await isListening(port)) throw Error(`Port ${port} is already in use. Stop the previous local test session first.`);
  const build = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'backend/functions/tsconfig.json'], { cwd: root, env, windowsHide: true, stdio: 'inherit' });
  if (build.status !== 0) throw Error('Backend build failed.');
  launch('emulators', ['backend/functions/node_modules/firebase-tools/lib/bin/firebase.js', 'emulators:start', '--project', 'demo-topheights-commerce', '--only', 'auth,firestore,storage']);
  await Promise.all([ready(8085), ready(9098), ready(9198)]);
  for (const seed of ['seed-local', 'seed-test-users']) {
    const result = spawnSync(process.execPath, [`backend/functions/scripts/${seed}.cjs`], { cwd: root, env, windowsHide: true, stdio: 'inherit' });
    if (result.status !== 0) throw Error('Local test setup failed.');
  }
  launch('commerce', ['backend/functions/scripts/serve-local.cjs']);
  launch('frontend', ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort']);
  await Promise.all([ready(5002), ready(5174)]);
  console.log('Ready: http://127.0.0.1:5174 — local accounts in .local/test-accounts.json. Press Ctrl+C to stop.');
})().catch(error => { console.error(error.message); stop(); process.exitCode = 1; });
