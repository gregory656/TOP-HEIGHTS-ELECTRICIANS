const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/services/userProfile.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const account = { uid: 'test-account', email: 'admin@example.test', displayName: 'Admin', photoURL: null };

function fixture(initial, failRead = false) {
  let stored = initial ? structuredClone(initial) : null;
  const writes = [];
  const firebase = {
    doc: (_, collection, uid) => `${collection}/${uid}`,
    serverTimestamp: () => 'new-timestamp',
    runTransaction: async (_, callback) => callback({
      get: async () => { if (failRead) throw new Error('Read unavailable'); return { exists: () => stored !== null, data: () => structuredClone(stored) }; },
      set: (ref, patch, options) => { writes.push({ref, patch, options}); stored = { ...stored, ...patch }; },
    }),
  };
  const context = { exports: {}, require: id => { assert.equal(id, 'firebase/firestore'); return firebase; } };
  vm.runInNewContext(compiled, context);
  return { sync: (...args) => context.exports.syncUserProfile({}, ...args), stored: () => stored, writes };
}

test('email and Google-style sign-ins preserve an assigned admin role and creation time', async () => {
  const f = fixture({ role: 'admin', createdAt: 'original', name: 'Site manager' });
  for (const identity of [account, { ...account, displayName: 'Google display name' }]) {
    assert.equal((await f.sync(identity, 'customer')).role, 'admin');
  }
  assert.equal(f.stored().role, 'admin');
  assert.equal(f.stored().createdAt, 'original');
  assert.ok(f.writes.every(({patch}) => !Object.hasOwn(patch, 'role') && !Object.hasOwn(patch, 'createdAt')));
});

test('a revoked admin role is not restored by the legacy owner-email default', async () => {
  const f = fixture({ role: 'customer', createdAt: 'original' });
  assert.equal((await f.sync(account, 'admin')).role, 'customer');
  assert.equal(f.stored().role, 'customer');
});

test('first sign-in creates a customer profile once and uses the registration name', async () => {
  const f = fixture(null);
  const user = await f.sync(account, 'customer', 'New Customer');
  assert.equal(user.role, 'customer');
  assert.equal(user.name, 'New Customer');
  assert.equal(f.stored().createdAt, 'new-timestamp');
  assert.equal(f.stored().role, 'customer');
  await f.sync(account, 'customer');
  assert.equal(f.writes.filter(({patch}) => Object.hasOwn(patch, 'createdAt')).length, 1);
});

test('read failure does not create or overwrite a user profile', async () => {
  const f = fixture({role: 'admin'}, true);
  await assert.rejects(f.sync(account, 'customer'), /Read unavailable/);
  assert.equal(f.writes.length, 0);
  assert.equal(f.stored().role, 'admin');
});

test('an existing profile without a valid admin role remains a customer', async () => {
  const f = fixture({name: 'Existing user'});
  assert.equal((await f.sync(account, 'admin')).role, 'customer');
  assert.ok(!Object.hasOwn(f.stored(), 'role'));
});

test('an initial admin hint cannot grant a new account administrator access', async () => {
  const f = fixture(null);
  assert.equal((await f.sync(account, 'admin')).role, 'customer');
  assert.equal(f.stored().role, 'customer');
});
