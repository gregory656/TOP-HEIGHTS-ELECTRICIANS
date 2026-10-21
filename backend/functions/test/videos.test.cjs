const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createNetlifyHandler } = require('../lib/netlify');
const { parseVideo } = require('../lib/catalogue');
const draft = { title: 'Installation', videoUrl: 'https://youtu.be/2agQs02DziE', placement: 'home-solar', order: 2, status: 'draft' };
function fixture() {
  const records = new Map();
  const snapshot = path => ({ exists: records.has(path), data: () => records.get(path) });
  const collection = filter => ({ get: async () => ({ docs: [...records].filter(([path, data]) => path.startsWith('videos/') && (!filter || data.status === filter)).map(([path, data]) => ({ id: path.split('/')[1], data: () => data })) }) });
  const api = createNetlifyHandler({ db: {
    doc: path => ({ path, get: async () => path.startsWith('users/') ? { data: () => ({ role: path === 'users/admin' ? 'admin' : 'customer' }) } : snapshot(path) }),
    collection: () => ({ ...collection(), where: (_field, _op, value) => collection(value) }),
    runTransaction: async work => work({ get: async ref => snapshot(ref.path), set: (ref, data) => records.set(ref.path, data) }),
  }, verifyToken: async token => { if (!['admin','customer'].includes(token)) throw Error('Bad token'); return { uid: token }; }, provider: {}, storefront: 'https://staging.example.test', mode: 'sandbox', webhookChallenge: '' });
  const call = async (path, body, token) => { const result = await api({ httpMethod: body === undefined ? 'GET' : 'POST', path, rawUrl: `https://staging.example.test${path}`, headers: { 'content-type':'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), isBase64Encoded: false }, {}); return { status: result.statusCode, body: JSON.parse(result.body) }; };
  return { call };
}
test('video validation accepts share links and rejects scripts, arbitrary hosts and invalid placements', () => {
  assert.equal(parseVideo(draft).embedUrl, 'https://www.youtube-nocookie.com/embed/2agQs02DziE');
  for (const change of [{videoUrl:'javascript:alert(1)'}, {videoUrl:'https://evil.test/watch?v=2agQs02DziE'}, {placement:'unknown'}, {order:-1}, {order:1.2}, {status:'other'}]) assert.throws(() => parseVideo({...draft,...change}));
});
test('video API protects edits, hides drafts, publishes replacements and archives without resurfacing content', async () => {
  const {call} = fixture();
  assert.equal((await call('/api/admin/videos/v1',draft)).status,401);
  assert.equal((await call('/api/admin/videos/list',{},'customer')).status,403);
  assert.equal((await call('/api/admin/videos/v1',draft,'customer')).status,403);
  assert.equal((await call('/api/admin/videos/v1',draft,'admin')).status,200);
  assert.equal((await call('/api/videos')).body.videos.length,0);
  assert.equal((await call('/api/admin/videos/v1',{...draft,version:1,status:'published'},'admin')).status,200);
  assert.equal((await call('/api/videos')).body.videos[0].videoUrl,draft.videoUrl);
  assert.equal((await call('/api/admin/videos/v1',{...draft,version:1,status:'published'},'admin')).status,409);
  assert.equal((await call('/api/admin/videos/v1',{...draft,version:2,status:'published',videoUrl:'https://youtu.be/dQw4w9WgXcQ'},'admin')).status,200);
  assert.equal((await call('/api/videos')).body.videos[0].videoUrl,'https://youtu.be/dQw4w9WgXcQ');
  assert.equal((await call('/api/admin/videos/v1',{...draft,version:3,status:'draft'},'admin')).status,200);
  assert.equal((await call('/api/videos')).body.videos.length,0);
  assert.equal((await call('/api/admin/videos/v1',{...draft,version:4,status:'archived'},'admin')).status,200);
  assert.equal((await call('/api/videos')).body.videos.length,0);
  const video=(await call('/api/admin/videos/list',{},'admin')).body.videos[0];
  assert.equal(video.status,'archived');assert.equal(video.version,5);
});
