const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createNetlifyHandler, handler, deploymentConfig } = require('../lib/netlify');
const { parseImageUpload, cloudinaryUploader, MAX_IMAGE_BYTES } = require('../lib/media');
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aKXcAAAAASUVORK5CYII=';
const image = { kind: 'products', contentType: 'image/png', data: png };
function fixture() {
  const uploads = [];
  const api = createNetlifyHandler({
    db: { doc: path => ({ get: async () => ({ data: () => ({ role: path === 'users/admin' ? 'admin' : 'customer' }) }) }) },
    verifyToken: async token => { if (!['admin', 'customer'].includes(token)) throw Error('Bad token'); return { uid: token }; },
    provider: {}, storefront: 'https://staging.example.test', mode: 'sandbox', webhookChallenge: '',
    imageUploader: async upload => { uploads.push(upload); return 'https://res.cloudinary.com/example/image/upload/image.png'; },
  });
  const call = (path, body, token) => api({ httpMethod: body === undefined ? 'GET' : 'POST', path, rawUrl: `https://staging.example.test${path}`,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), isBase64Encoded: false }, {});
  return { call, uploads };
}
test('Netlify serves the API through rewrite and direct function paths', async () => {
  const f = fixture();
  for (const path of ['/api/health', '/.netlify/functions/api/health', '/health']) {
    const result = await f.call(path);
    assert.equal(result.statusCode, 200);
    assert.equal(JSON.parse(result.body).payments, 'sandbox');
  }
});
test('anonymous and customer uploads never reach the image provider', async () => {
  const f = fixture();
  assert.equal((await f.call('/api/admin/media/upload', image)).statusCode, 401);
  assert.equal((await f.call('/api/admin/media/upload', image, 'customer')).statusCode, 403);
  assert.equal(f.uploads.length, 0);
});
test('admin uploads preserve the destination and return the hosted image', async () => {
  const f = fixture();
  for (const kind of ['products', 'news']) {
    const result = await f.call('/api/admin/media/upload', { ...image, kind }, 'admin');
    assert.equal(result.statusCode, 200);
    assert.match(JSON.parse(result.body).url, /^https:\/\/res\.cloudinary\.com\//);
  }
  assert.deepEqual(f.uploads.map(value => value.kind), ['products', 'news']);
});
test('upload validation rejects remote fetches, spoofed images and oversized files', async () => {
  const f = fixture();
  for (const value of [{ ...image, data: 'https://example.test/file' }, { ...image, contentType: 'image/svg+xml' },
    { ...image, data: Buffer.from('<script>bad</script>').toString('base64') }, { ...image, kind: '../private' },
    { ...image, data: Buffer.alloc(MAX_IMAGE_BYTES).toString('base64') }]) {
    assert.equal((await f.call('/api/admin/media/upload', value, 'admin')).statusCode, 400);
  }
  assert.equal((await f.call('/api/admin/media/upload', { ...image, data: 'a'.repeat(4400000) }, 'admin')).statusCode, 413);
  assert.equal(f.uploads.length, 0);
});
test('Cloudinary uploads use server credentials and non-overwriting image-only requests', async t => {
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, 'https://api.cloudinary.com/v1_1/example/image/upload');
    assert.equal(init.headers.Authorization, `Basic ${Buffer.from('key:private-test-value').toString('base64')}`);
    assert.equal(init.redirect, 'error');
    assert.equal(init.body.get('overwrite'), 'false');
    assert.equal(init.body.get('allowed_formats'), 'jpg,png,webp,gif');
    assert.match(init.body.get('public_id'), /^commerce\/products\/[\w-]+$/);
    assert.equal(init.body.get('file'), `data:image/png;base64,${png}`);
    return new Response(JSON.stringify({ secure_url: 'https://res.cloudinary.com/example/image/upload/v1/image.png' }));
  });
  const upload = cloudinaryUploader({ cloudName: 'example', apiKey: 'key', apiSecret: 'private-test-value' });
  assert.equal(await upload(parseImageUpload(image)), 'https://res.cloudinary.com/example/image/upload/v1/image.png');
});
test('missing configuration and provider errors do not disclose credentials', async t => {
  await assert.rejects(cloudinaryUploader({})(image), { status: 503 });
  t.mock.method(globalThis, 'fetch', async () => new Response('private-test-value', { status: 401 }));
  await assert.rejects(cloudinaryUploader({ cloudName: 'example', apiKey: 'key', apiSecret: 'private-test-value' })(image), error => error.status === 502 && !error.message.includes('private-test-value'));
});
test('deployment configuration isolates staging and explicitly selected production', () => {
  const staging = deploymentConfig({ STOREFRONT_ORIGIN: 'https://staging.example.test' });
  assert.equal(staging.projectId, 'top-heights-staging-408995');
  assert.equal(staging.mode, 'sandbox');
  assert.equal(staging.indexable, false);
  const live = deploymentConfig({ COMMERCE_ENVIRONMENT: 'production', STOREFRONT_ORIGIN: 'https://topheightselectricals.com' });
  assert.equal(live.projectId, 'top-heights-electricals');
  assert.equal(live.mode, 'live');
  assert.equal(live.indexable, true);
  for (const origin of ['https://staging.example.test', 'http://topheightselectricals.com', 'https://topheightselectricals.com/path']) {
    assert.throws(() => deploymentConfig({ COMMERCE_ENVIRONMENT: 'production', STOREFRONT_ORIGIN: origin }));
  }
  assert.throws(() => deploymentConfig({ COMMERCE_ENVIRONMENT: 'typo', STOREFRONT_ORIGIN: 'https://topheightselectricals.com' }));
});

test('default staging deployment refuses production Firebase credentials before initialization', async () => {
  const previous = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  try {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({ project_id: 'top-heights-electricals' });
    const result = await handler({ path: '/api/health', httpMethod: 'GET', headers: {} }, {});
    assert.equal(result.statusCode, 503);
  } finally {
    if (previous === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    else process.env.FIREBASE_SERVICE_ACCOUNT_JSON = previous;
  }
});
