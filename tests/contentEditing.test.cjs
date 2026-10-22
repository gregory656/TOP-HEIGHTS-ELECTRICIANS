const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require: name => { if (!(name in imports)) throw Error('Unexpected import ' + name); return imports[name]; } };
  vm.runInNewContext(code, context);
  return context.exports;
}
const { normalizePost, catalogueDraft, contentSlug, articleForSave } = load('src/services/contentModel.ts');

test('legacy articles without slugs remain editable and preserve content and versions', () => {
  const post = normalizePost('legacy', { title: 'Solar & safety', content: 'Original article', date: '2025-03-04T10:00:00Z', active: true, version: 7 });
  assert.equal(post.slug, 'solar-safety');
  assert.equal(post.content, 'Original article');
  assert.equal(post.excerpt, 'Original article');
  assert.equal(post.publishedDate, '2025-03-04');
  assert.equal(post.status, 'draft');
  assert.equal(post.tags.length, 0);
  assert.equal(post.version, 7);
  assert.equal(contentSlug('  NEW!  Solar panel  '), 'new-solar-panel');
});

test('existing catalogue drafts never invent stock or publish automatically', () => {
  const draft = catalogueDraft({ id: 1, name: 'Solar panel', price: 18500, category: 'Solar', image: '/panel.jpg', inStock: true });
  assert.equal(draft.id, '1');
  assert.equal(draft.price, 18500);
  assert.equal(draft.slug, 'solar-panel');
  assert.equal(draft.stock, 0);
  assert.equal(draft.published, false);
  assert.equal(draft.status, 'draft');
  assert.equal(draft.images[0], '/panel.jpg');
});

test('empty live catalogue and permission errors never reintroduce hardcoded products', async () => {
  let listener, failure;
  const service = load('src/services/productService.ts', {
    'firebase/firestore': { collection: () => ({}), query: () => ({}), where: () => ({}), getDocs: async () => ({ docs: [] }), onSnapshot: (_query, success, error) => { listener = success; failure = error; return () => {}; } },
    './firebase': { db: {}, firebaseAuthConfigured: true },
    '../data/products': { products: [{ id: 'static', name: 'Static product' }] },
  });
  assert.equal((await service.fetchProducts()).length, 0);
  let rows, problem;
  service.subscribeProducts(value => { rows = value; }, error => { problem = error; });
  listener({ docs: [] });
  assert.equal(rows.length, 0);
  const denied = new Error('Permission denied');
  failure(denied);
  assert.equal(problem, denied);
  assert.equal(rows.length, 0);
});

test('explicit publishing preserves article fields and changes persisted status; draft saves remain private', () => {
  const post = normalizePost('post', { title: 'Solar guide', content: 'Full guide', excerpt: 'Read this guide', image: '/solarenergy.jpeg', publishedDate: '2026-10-20', status: 'draft', version: 4 });
  const published = articleForSave(post, 'published', '2026-10-21');
  assert.equal(published.status, 'published');
  assert.equal(published.version, 4);
  assert.equal(published.content, post.content);
  assert.equal(post.status, 'draft');
  assert.equal(articleForSave(published, 'draft').status, 'draft');
  for (const change of [{ excerpt: '' }, { content: '' }, { image: '' }, { publishedDate: '2026-10-22' }, { publishedDate: '2026-02-31' }]) assert.throws(() => articleForSave({ ...post, ...change }, 'published', '2026-10-21'));
  assert.equal(articleForSave({ ...post, content: '', image: '' }, 'draft').status, 'draft');
});
