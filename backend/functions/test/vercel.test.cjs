const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createVercelHandler, vercelEnvironment } = require('../lib/vercel');
const { vercelBuildEnvironment } = require('../../../scripts/build-vercel.cjs');

test('Vercel preview cannot use production Firebase or payment configuration', () => {
  const live = { VERCEL_ENV: 'production', COMMERCE_ENVIRONMENT: 'production', VITE_FIREBASE_PROJECT_ID: 'top-heights-electricals', VITE_USE_FIREBASE_EMULATORS: 'false', STOREFRONT_ORIGIN: 'https://topheightselectricals.com' };
  assert.equal(vercelBuildEnvironment(live).VITE_INDEXABLE, 'true');
  assert.throws(() => vercelBuildEnvironment({ ...live, VERCEL_ENV: 'preview' }));
  assert.throws(() => vercelEnvironment({ ...live, VERCEL_ENV: 'preview' }));
  assert.throws(() => vercelBuildEnvironment({ ...live, VITE_FIREBASE_PROJECT_ID: 'top-heights-staging-408995' }));
  const preview = { ...live, VERCEL_ENV: 'preview', VERCEL_URL: 'preview.example.test', COMMERCE_ENVIRONMENT: 'staging', VITE_FIREBASE_PROJECT_ID: 'top-heights-staging-408995' };
  assert.equal(vercelBuildEnvironment(preview).VITE_COMMERCE_API_URL, 'https://preview.example.test/api');
  assert.equal(vercelBuildEnvironment(preview).VITE_INDEXABLE, 'false');
  assert.equal(vercelEnvironment(preview).STOREFRONT_ORIGIN, 'https://preview.example.test');
});

test('unconfigured Vercel runtime returns a sanitized 503 using native Node responses', async t => {
  const server = http.createServer(createVercelHandler(() => { throw Error('private credential value'); }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/health');
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.doesNotMatch(await response.text(), /private credential/);
});

test('Vercel rewrites serve API and product HTML, preserve auth and never charge anonymously', async t => {
  let charges = 0;
  const product = { name: 'Solar kit', slug: 'solar-kit', published: true, price: 10, stock: 1, active: true };
  const handler = createVercelHandler(() => ({
    db: { collection: () => ({ where: () => ({ limit: () => ({ get: async () => ({ docs: [{ data: () => product }] }) }) }) }) },
    verifyToken: async () => { throw Error('Unauthenticated'); },
    provider: { assertReady() {}, create: async () => { charges++; return {}; } },
    mode: 'live', storefront: 'https://topheightselectricals.com', webhookChallenge: 'a'.repeat(32),
    indexable: true, htmlTemplate: '<html><head><title>Site</title></head><body><div id="root"></div></body></html>',
  }));
  const server = http.createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const origin = 'http://127.0.0.1:' + server.address().port;
  const request = (route, init) => fetch(origin + '/api/commerce?__commerce_path=' + encodeURIComponent(route), init);
  const health = await request('/api/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).payments, 'live');
  assert.equal((await request('/api/orders/test/payment', { method: 'POST' })).status, 401);
  assert.equal((await request('/api/admin/products/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
  assert.equal((await request('/api/payments/intasend/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"challenge":"wrong"}' })).status, 401);
  const page = await request('/shop/solar-kit');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Solar kit/);
  assert.equal(charges, 0);
});
