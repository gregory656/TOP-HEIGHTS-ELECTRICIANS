const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/services/privacyPreferences.ts'), 'utf8');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
const { readPrivacyChoice, createAnalyticsController } = context.exports;

test('privacy choice defaults to no consent for missing, corrupt, stale or inaccessible storage', () => {
  const now = Date.now();
  for (const value of [null, '{broken', JSON.stringify({ version: 1, analytics: true }), JSON.stringify({ version: 1, analytics: 'true', savedAt: now }), JSON.stringify({ version: 1, analytics: true, savedAt: 0 }), JSON.stringify({ version: 1, analytics: true, savedAt: now + 1 })]) {
    assert.equal(readPrivacyChoice({ getItem: () => value }, now), null);
  }
  assert.equal(readPrivacyChoice({ getItem() { throw Error('Storage blocked'); } }, now), null);
  for (const analytics of [false, true]) assert.equal(readPrivacyChoice({ getItem: () => JSON.stringify({ version: 1, analytics, savedAt: now }) }, now).analytics, analytics);
});

test('essential-only never imports analytics; withdrawal disables previously accepted collection', async () => {
  let imports = 0, starts = 0, stops = 0;
  const apply = createAnalyticsController(async () => { imports++; return { enable() { starts++; }, disable() { stops++; } }; });
  await apply(false);
  assert.equal(imports, 0);
  await apply(true);
  assert.equal(imports, 1);
  assert.equal(starts, 1);
  await apply(false);
  assert.equal(stops, 1);
});

test('withdrawing while the analytics module loads prevents initialization', async () => {
  let resolve, starts = 0;
  const apply = createAnalyticsController(() => new Promise(done => { resolve = done; }));
  const pending = apply(true);
  await apply(false);
  resolve({ enable() { starts++; }, disable() {} });
  await pending;
  assert.equal(starts, 0);
});
