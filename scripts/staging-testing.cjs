const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn, spawnSync } = require('node:child_process');
const { root, projectId } = require('../backend/functions/scripts/staging-context.cjs');
const children = [];
let stopping = false;

const listening = port => new Promise(resolve => {
  const socket = net.connect(port, '127.0.0.1');
  socket.once('connect', () => { socket.destroy(); resolve(true); });
  socket.once('error', () => resolve(false));
});
function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else child.kill('SIGTERM');
  }
}
function launch(name, args, env) {
  const file = fs.openSync(path.join(root, '.local', `staging-${name}.log`), 'w');
  const child = spawn(process.execPath, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', file, file] });
  fs.closeSync(file);
  children.push(child);
  child.on('error', error => { console.error(error.message); process.exitCode = 1; stop(); });
  child.on('exit', code => {
    if (!stopping) { console.error(`${name} stopped (${code}). See .local/staging-${name}.log.`); process.exitCode = 1; stop(); }
  });
  return child;
}
async function ready(port, child) {
  for (let i = 0; i < 120; i++) {
    if (stopping || child.exitCode !== null) throw Error('Staging startup failed; check .local/staging-*.log.');
    if (await listening(port)) return;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw Error(`Port ${port} did not start; check .local/staging-*.log.`);
}
process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });

(async () => {
  if (!fs.existsSync(path.join(root, '.env.staging.local'))) throw Error('Staging setup is incomplete: .env.staging.local is missing.');
  const { loadEnv } = await import('vite');
  const env = { ...process.env, ...loadEnv('staging', root, '') };
  for (const name of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST', 'FIREBASE_STORAGE_EMULATOR_HOST']) {
    if (env[name]) throw Error(`Unset ${name} before starting cloud staging.`);
  }
  if (env.VITE_FIREBASE_PROJECT_ID !== projectId || env.VITE_USE_FIREBASE_EMULATORS !== 'false') throw Error('Staging must use its isolated cloud Firebase project.');
  if (env.VITE_COMMERCE_API_URL !== 'http://127.0.0.1:5003') throw Error('Staging API must use http://127.0.0.1:5003.');
  env.GCLOUD_PROJECT = projectId;
  env.VITE_SITE_URL = 'http://127.0.0.1:5175';
  env.VITE_INDEXABLE = 'false';
  for (const port of [5003, 5175]) if (await listening(port)) throw Error(`Port ${port} is already in use. Stop the previous staging session first.`);
  fs.mkdirSync(path.join(root, '.local'), { recursive: true });
  const build = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'backend/functions/tsconfig.json'], { cwd: root, env, windowsHide: true, stdio: 'inherit' });
  if (build.status !== 0) throw Error('Backend build failed.');
  const api = launch('api', ['backend/functions/scripts/serve-staging.cjs'], env);
  await ready(5003, api);
  const health = await (await fetch('http://127.0.0.1:5003/staging-health')).json();
  if (health.projectId !== projectId || health.paymentsEnabled !== false) throw Error('The API is not the expected staging service.');
  const frontend = launch('frontend', ['node_modules/vite/bin/vite.js', '--mode', 'staging', '--host', '127.0.0.1', '--port', '5175', '--strictPort'], env);
  await ready(5175, frontend);
  console.log(`Ready: http://127.0.0.1:5175/admin — real accounts and saved content in ${projectId}.`);
  console.log('API runs on this computer. Payments are disabled. Press Ctrl+C to stop.');
})().catch(error => { console.error(error.message); stop(); process.exitCode = 1; });
