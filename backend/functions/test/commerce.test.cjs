const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');
const { ref, uploadBytes, getBytes } = require('firebase/storage');
const { createCommerceApp } = require('../lib/app');
const { money, parseOrder, checkoutUrl, CommerceError } = require('../lib/commerce');

if (!process.env.FIRESTORE_EMULATOR_HOST) throw Error('Run through the Firestore emulator; live databases are forbidden in these tests.');
const projectId = 'demo-topheights-tests';
const adminApp = initializeApp({ projectId });
const db = getFirestore(adminApp);
const challenge = 'local-test-webhook-challenge-at-least-32-characters';
let rules;
before(async () => {
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
  const [storageHost, storagePort] = (process.env.FIREBASE_STORAGE_EMULATOR_HOST || '').split(':');
  rules = await initializeTestEnvironment({ projectId, storage: { host: storageHost, port: Number(storagePort), rules: fs.readFileSync(path.join(__dirname, '../../storage.rules'), 'utf8') }, firestore: { host, port: Number(port), rules: fs.readFileSync(path.join(__dirname, '../../firestore.rules'), 'utf8') } });
});
beforeEach(async () => {
  await rules.clearFirestore();
  await Promise.all([
    db.doc('products/1').set({ name: 'Solar panel', active: true, published: true, status: 'active', price: 1000, stock: 10, version: 1 }),
    db.doc('settings/global').set({ shippingFee: 60 }),
    db.doc('users/admin').set({ uid: 'admin', role: 'admin', name: 'Owner', createdAt: 'original' }),
    db.doc('users/alice').set({ uid: 'alice', role: 'customer', name: 'Customer' }),
  ]);
});
after(async () => { await rules.cleanup(); await deleteApp(adminApp); });

function request(overrides = {}) {
  return { idempotencyKey: 'local-checkout-reference-12345', paymentMethod: 'MPESA',
    customerInfo: { fullName: 'Test Customer', email: 'customer@example.test', phone: '0712345678', deliveryAddress: 'Voi' },
    items: [{ productId: '1', quantity: 2, price: 0.01 }], totalAmount: 0.02, ...overrides };
}
async function fixture(t, mode = 'live') {
  const calls = [];
  let state = 'PENDING', invoiceOverrides = {}, failedCreate = false, configured = true;
  const provider = {
    assertReady() { if (!configured) throw new CommerceError(503, 'Not configured'); },
    async create(payload) { calls.push(payload); if (failedCreate) throw Error('Ambiguous upstream timeout'); return { id: 'checkout-123', signature: 'server-only-signature', url: `https://${mode === 'live' ? 'payment' : 'sandbox'}.intasend.com/checkout/test` }; },
    async status(session) {
      assert.equal(session.checkoutId, 'checkout-123'); assert.equal(session.signature, 'server-only-signature');
      return { invoice: { invoice_id: 'invoice-123', state, currency: 'KES', value: '2060.00', api_ref: calls[0]?.api_ref, ...invoiceOverrides } };
    },
  };
  const app = createCommerceApp({ db, provider, mode, storefront: 'https://shop.example.test', webhookChallenge: challenge, htmlTemplate: '<html><head><title>Old title</title></head><body><div id="root"></div></body></html>', indexable: true,
    verifyToken: async token => { if (!['alice', 'bob', 'admin'].includes(token)) throw Error('Invalid ID token'); return { uid: token }; } });
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  async function call(url, body = {}, token = 'alice', method = 'POST') {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${url}`, { method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: method === 'GET' ? undefined : JSON.stringify(body) });
    const text = await response.text(); let data = {}; try { data = JSON.parse(text); } catch { /* HTML and XML are intentionally not JSON. */ }
    return { status: response.status, body: data, text, cache: response.headers.get('cache-control') };
  }
  const order = await call('/orders', request());
  assert.equal(order.status, 200);
  const orderId = order.body.orderId;
  return { call, orderId, quote: order.body, calls,
    start: () => call(`/orders/${orderId}/payment`), refresh: (token = 'alice') => call(`/orders/${orderId}/status`, {}, token),
    saved: async () => (await db.doc(`orders/${orderId}`).get()).data(),
    change: (next, overrides = {}) => { state = next; invoiceOverrides = overrides; }, failCreate: () => { failedCreate = true; }, configure: value => { configured = value; } };
}

test('town names and Kenyan phone variants are accepted, numeric-only locations rejected', () => {
  for (const town of ['Voi', 'Embu', 'Thika', 'Nakuru', 'Ng’ong', 'Nairobi, near the stage']) {
    for (const phone of ['0712345678', '0112345678', '+254 712 345 678', '254112345678']) {
      assert.equal(parseOrder(request({ customerInfo: { ...request().customerInfo, deliveryAddress: town, phone } })).customerInfo.deliveryAddress, town);
    }
  }
  for (const town of ['', ' ', '20100']) assert.throws(() => parseOrder(request({ customerInfo: { ...request().customerInfo, deliveryAddress: town } })));
  for (const value of ['1e2', '-1', '1.001', NaN, Infinity, {}, null]) assert.throws(() => money(value));
  assert.equal(money('1000.01'), 100001);
});
test('auth, authoritative prices, duplicate checkout and request conflicts', async t => {
  const f = await fixture(t);
  assert.equal(f.quote.totalAmount, 2060);
  assert.equal((await f.call('/orders', request(), null)).status, 401);
  assert.equal((await f.call('/orders', request(), 'invalid')).status, 401);
  const repeats = await Promise.all([f.call('/orders', request()), f.call('/orders', request())]);
  assert.ok(repeats.every(r => r.body.orderId === f.orderId));
  assert.equal((await db.collection('orders').get()).size, 1);
  assert.equal((await f.call('/orders', request({ items: [{ productId: '1', quantity: 3 }] }))).status, 409);
  for (const quantity of [0, -1, 1.2, 100, '2']) assert.equal((await f.call('/orders', request({ items: [{ productId: '1', quantity }] }))).status, 400);
  assert.equal((await f.call('/orders', request({ idempotencyKey: 'other-checkout-reference', items: [{ productId: 'missing', quantity: 1 }] }))).status, 409);
});
test('cross-user payment/status, old routes and unknown orders cannot be used', async t => {
  const f = await fixture(t);
  assert.equal((await f.call(`/orders/${f.orderId}/payment`, {}, 'bob')).status, 404);
  assert.equal((await f.refresh('bob')).status, 403);
  assert.equal((await f.call('/orders/unknown/status')).status, 404);
  assert.equal((await f.call('/mpesa/callback', { orderId: 'phantom', state: 'COMPLETE' })).status, 404);
  assert.equal((await db.doc('orders/phantom').get()).exists, false);
  assert.equal(f.calls.length, 0);
});
test('concurrent initiation issues one provider checkout and reuses it', async t => {
  const f = await fixture(t);
  const results = await Promise.all([f.start(), f.start(), f.start()]);
  assert.ok(results.every(r => [200, 409].includes(r.status)));
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].amount, '2060.00');
  assert.equal(f.calls[0].method, 'M-PESA');
  assert.equal(f.calls[0].phone_number, '254712345678');
  assert.equal((await f.start()).status, 200);
  assert.equal(f.calls.length, 1);
  assert.equal((await f.saved()).paymentVerified, false);
});

test('M-Pesa is the only new payment method and bypass attempts do not create orders', async t => {
  const f = await fixture(t);
  for (const paymentMethod of ['INTASEND', 'CARD', 'CASH', '', null]) {
    const result = await f.call('/orders', request({ idempotencyKey: 'disabled-method-reference', paymentMethod }));
    assert.equal(result.status, 400);
    assert.match(result.body.error, /M-Pesa/);
  }
  assert.equal((await db.collection('orders').get()).size, 1);
  assert.equal((await f.saved()).paymentMethod, 'MPESA');
  assert.equal(f.calls.length, 0);
});

test('older non-M-Pesa orders remain readable but cannot start another payment', async t => {
  const f = await fixture(t);
  await db.doc(`orders/${f.orderId}`).update({ paymentMethod: 'INTASEND' });
  assert.equal((await f.start()).status, 409);
  assert.equal(f.calls.length, 0);
  assert.equal((await f.refresh()).status, 200);
  assert.equal((await f.saved()).paymentMethod, 'INTASEND');
  const alice = rules.authenticatedContext('alice').firestore();
  await assertSucceeds(getDoc(doc(alice, `orders/${f.orderId}`)));
});
test('an ambiguous provider failure remains pending review without a duplicate request', async t => {
  const f = await fixture(t); f.failCreate();
  assert.equal((await f.start()).status, 500);
  assert.equal((await f.start()).status, 409);
  assert.equal(f.calls.length, 1);
  assert.equal((await f.saved()).paymentStatus, 'processing');
});
test('missing configuration can be corrected without poisoning the payment session', async t => {
  const f = await fixture(t); f.configure(false);
  assert.equal((await f.start()).status, 503);
  assert.equal((await db.doc(`paymentSessions/${f.orderId}`).get()).exists, false);
  assert.equal((await f.saved()).paymentStatus, 'pending');
  f.configure(true);
  assert.equal((await f.start()).status, 200);
  assert.equal(f.calls.length, 1);
});
test('forged callbacks and client completion cannot mark an order paid', async t => {
  const f = await fixture(t); await f.start();
  assert.equal((await f.call('/payments/intasend/webhook', { api_ref: f.calls[0].api_ref, challenge: 'wrong', state: 'COMPLETE' }, null)).status, 401);
  assert.equal((await f.call('/payments/intasend/webhook', { api_ref: f.calls[0].api_ref, challenge, state: 'COMPLETE', value: '2060.00' }, null)).status, 200);
  assert.equal((await f.saved()).paymentStatus, 'processing');
  assert.equal((await f.saved()).paymentVerified, false);
});
test('wrong amount, currency, reference, aliased status and malformed invoice cannot settle', async t => {
  const f = await fixture(t); await f.start();
  for (const override of [{ value: '0.01' }, { currency: 'USD' }, { api_ref: 'other-order' }, { state: 'success' }, { invoice_id: '../other' }, { value: '2.06e3' }]) {
    f.change('COMPLETE', override);
    assert.notEqual((await f.refresh()).status, 200);
    assert.equal((await f.saved()).paymentVerified, false);
  }
});

test('webhook invoice hints require matching authoritative verification and persist for refresh', async t => {
  const f = await fixture(t); await f.start();
  const event = { api_ref: f.calls[0].api_ref, challenge, invoice_id: 'invoice-123', state: 'COMPLETE' };
  assert.equal((await f.call('/payments/intasend/webhook', { ...event, invoice_id: '../invalid' }, null)).status, 400);
  assert.equal((await f.call('/payments/intasend/webhook', { ...event, invoice_id: 'different-invoice' }, null)).status, 409);
  assert.equal((await f.call('/payments/intasend/webhook', event, null)).status, 200);
  assert.equal((await f.saved()).paymentVerified, false);
  assert.equal((await db.doc(`paymentSessions/${f.orderId}`).get()).data().invoiceId, 'invoice-123');
  f.change('COMPLETE');
  assert.equal((await f.call('/payments/intasend/webhook', event, null)).status, 200);
  assert.equal((await f.refresh()).body.paymentVerified, true);
  assert.equal((await db.doc('products/1').get()).data().stock, 8);
  assert.equal((await f.call('/payments/intasend/webhook', event, null)).status, 200);
  assert.equal((await db.doc('products/1').get()).data().stock, 8);
});
test('verified payment, webhook replay and late failure preserve one sale and delivery state', async t => {
  const f = await fixture(t); await f.start(); f.change('COMPLETE');
  assert.equal((await f.refresh()).body.paymentVerified, true);
  assert.equal((await f.saved()).orderStatus, 'processed');
  assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, { orderStatus: 'shipped' }, 'alice', 'PATCH')).status, 403);
  assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, { orderStatus: 'completed' }, 'admin', 'PATCH')).status, 409);
  assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, { orderStatus: 'shipped' }, 'admin', 'PATCH')).status, 200);
  for (const state of ['COMPLETE', 'PENDING', 'FAILED']) {
    f.change(state);
    assert.equal((await f.call('/payments/intasend/webhook', { api_ref: f.calls[0].api_ref, challenge }, null)).status, 200);
    assert.equal((await f.saved()).paymentStatus, 'paid');
    assert.equal((await f.saved()).orderStatus, 'shipped');
  }
  assert.equal((await db.collection('transactions').get()).size, 1);
  assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, { orderStatus: 'completed' }, 'admin', 'PATCH')).status, 200);
  assert.equal((await db.collection('fulfilmentEvents').get()).size, 3);
});
test('sandbox and unpaid orders cannot be fulfilled; unsafe provider redirects rejected', async t => {
  const f = await fixture(t, 'sandbox');
  assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, { orderStatus: 'shipped' }, 'admin', 'PATCH')).status, 409);
  await f.start(); f.change('COMPLETE'); await f.refresh();
  assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, { orderStatus: 'shipped' }, 'admin', 'PATCH')).status, 409);
  for (const url of ['http://payment.intasend.com/', 'https://payment.intasend.com.evil.test/', 'https://user@payment.intasend.com/', 'javascript:alert(1)']) assert.throws(() => checkoutUrl(url, 'live'));
});
test('rules block self-admin creation and escalation but preserve profile updates', async () => {
  const alice = rules.authenticatedContext('alice').firestore(), newbie = rules.authenticatedContext('new').firestore();
  await assertFails(updateDoc(doc(alice, 'users/alice'), { role: 'admin' }));
  await assertFails(setDoc(doc(newbie, 'users/new'), { uid: 'new', role: 'admin' }));
  await assertSucceeds(setDoc(doc(newbie, 'users/new'), { uid: 'new', role: 'customer', name: 'New Customer' }));
  await assertSucceeds(updateDoc(doc(alice, 'users/alice'), { name: 'Updated', email: 'new@example.test', updatedAt: 'now' }));
  const admin = rules.authenticatedContext('admin').firestore();
  await assertSucceeds(updateDoc(doc(admin, 'users/admin'), { name: 'Owner updated' }));
  await assertFails(updateDoc(doc(admin, 'users/admin'), { role: 'customer' }));
});
test('rules deny direct order/payment writes including admin, isolate reads and secrets', async t => {
  const f = await fixture(t);
  const alice = rules.authenticatedContext('alice').firestore(), bob = rules.authenticatedContext('bob').firestore(), admin = rules.authenticatedContext('admin').firestore();
  await assertFails(setDoc(doc(alice, 'orders/forged'), { userId: 'alice', paymentStatus: 'pending', orderStatus: 'pending', totalAmount: 1 }));
  for (const client of [alice, admin]) await assertFails(updateDoc(doc(client, `orders/${f.orderId}`), { paymentStatus: 'paid', paymentVerified: true }));
  await assertSucceeds(getDoc(doc(alice, `orders/${f.orderId}`)));
  await assertSucceeds(getDocs(query(collection(alice, 'orders'), where('userId', '==', 'alice'))));
  await assertSucceeds(getDocs(collection(admin, 'orders')));
  await assertFails(getDoc(doc(bob, `orders/${f.orderId}`)));
  await assertFails(getDocs(collection(alice, 'orders')));
  await f.start();
  for (const client of [alice, admin]) await assertFails(getDoc(doc(client, `paymentSessions/${f.orderId}`)));
});


const productInput = (changes = {}) => ({ name: 'Test inverter', slug: 'test-inverter', sku: 'INV-001', description: 'Short description', details: 'Full details', category: 'Inverters', price: 12000, comparisonPrice: 14000, images: ['/solarenergy.jpeg'], specifications: [{ label: 'Power', value: '3 kW' }], stock: 5, lowStockThreshold: 2, status: 'draft', published: false, featured: true, ...changes });
const postInput = (changes = {}) => ({ title: 'Solar advice', slug: 'solar-advice', excerpt: 'Useful advice', summary: 'A summary', content: '<script>not executed</script>\nPlain article text', author: 'Top Heights', category: 'Solar', tags: ['solar'], mediaType: 'image', image: '/solarenergy.jpeg', videoUrl: '', status: 'draft', publishedDate: '2026-09-01', seoTitle: '', seoDescription: '', ...changes });

test('only admins can create products; validation, unique keys, versions and archive are enforced', async t => {
  const f = await fixture(t);
  for (const token of ['alice', 'bob', null]) assert.ok([401, 403].includes((await f.call('/admin/products/new', productInput(), token)).status));
  for (const changes of [{ price: -1 }, { price: 0 }, { stock: -1 }, { stock: 1.5 }, { slug: '../private' }, { images: ['javascript:alert(1)'] }, { sku: 'bad/sku' }, { lowStockThreshold: -1 }]) {
    assert.equal((await f.call('/admin/products/new', productInput(changes), 'admin')).status, 400);
  }
  assert.equal((await f.call('/admin/products/new', productInput(), 'admin')).status, 200);
  assert.equal((await f.call('/admin/products/other', productInput(), 'admin')).status, 409);
  assert.equal((await f.call('/admin/products/new', productInput({ price: 13000 }), 'admin')).status, 409);
  assert.equal((await f.call('/admin/products/new', productInput({ version: 1, stock: 6 }), 'admin')).status, 400);
  assert.equal((await f.call('/admin/products/new', productInput({ version: 1, price: 13000, status: 'active', published: true }), 'admin')).status, 200);
  assert.equal((await db.doc('products/new').get()).data().price, 13000);
  assert.equal((await f.call('/admin/products/new', productInput({ version: 2, status: 'archived', published: true }), 'admin')).status, 200);
  const archived = (await db.doc('products/new').get()).data();
  assert.equal(archived.published, false); assert.equal(archived.active, false); assert.equal(archived.stock, 5);
  assert.equal((await db.collection('inventoryMovements').get()).size, 1);
});

test('stock adjustments are atomic, nonnegative, auditable and idempotent', async t => {
  const f = await fixture(t);
  await f.call('/admin/products/new', productInput(), 'admin');
  const adjust = (type, quantity, version, key = `stock-${type}-${version}`) => ({ type, quantity, version, note: 'Warehouse count', requestId: key });
  assert.equal((await f.call('/admin/products/new/stock', adjust('stock_in', 3, 1), 'alice')).status, 403);
  const payload = adjust('stock_in', 3, 1);
  const requests = await Promise.all([f.call('/admin/products/new/stock', payload, 'admin'), f.call('/admin/products/new/stock', payload, 'admin')]);
  assert.ok(requests.every(r => r.status === 200)); assert.equal(requests[0].body.newQuantity, 8);
  assert.equal((await f.call('/admin/products/new/stock', adjust('stock_out', 9, 2), 'admin')).status, 409);
  assert.equal((await f.call('/admin/products/new/stock', adjust('stock_out', 2, 2), 'admin')).body.newQuantity, 6);
  assert.equal((await f.call('/admin/products/new/stock', adjust('damaged', 1, 3), 'admin')).body.newQuantity, 5);
  assert.equal((await f.call('/admin/products/new/stock', adjust('returned', 1, 4), 'admin')).body.newQuantity, 6);
  assert.equal((await f.call('/admin/products/new/stock', adjust('correction', 4, 5), 'admin')).body.newQuantity, 4);
  const movements = (await db.collection('inventoryMovements').where('productId', '==', 'new').get()).docs.map(d => d.data());
  assert.equal(movements.length, 6);
  assert.ok(movements.every(m => m.actor === 'admin' && m.createdAt && m.newQuantity >= 0));
  assert.equal((await f.call('/admin/products/new/stock', { ...payload, quantity: 4 }, 'admin')).status, 409);
});

test('customers read only published products and cannot bypass product, stock or audit APIs', async t => {
  const f = await fixture(t);
  await f.call('/admin/products/new', productInput(), 'admin');
  const customer = rules.authenticatedContext('alice').firestore(), publicDb = rules.unauthenticatedContext().firestore(), admin = rules.authenticatedContext('admin').firestore();
  for (const client of [customer, publicDb]) {
    await assertFails(getDoc(doc(client, 'products/new')));
    await assertFails(getDocs(collection(client, 'products')));
    await assertSucceeds(getDocs(query(collection(client, 'products'), where('published', '==', true))));
  }
  await assertSucceeds(getDoc(doc(admin, 'products/new')));
  for (const client of [customer, admin]) {
    await assertFails(setDoc(doc(client, 'products/forged'), productInput()));
    await assertFails(updateDoc(doc(client, 'products/1'), { stock: 9999 }));
    await assertFails(setDoc(doc(client, 'inventoryMovements/forged'), { productId: '1', newQuantity: 9999 }));
  }
  await assertFails(getDocs(collection(customer, 'inventoryMovements')));
  await f.call('/admin/products/new', productInput({ version: 1, status: 'active', published: true }), 'admin');
  await assertSucceeds(getDoc(doc(publicDb, 'products/new')));
  await f.call('/admin/products/new', productInput({ version: 2, status: 'draft', published: false }), 'admin');
  await assertFails(getDoc(doc(publicDb, 'products/new')));
});

test('stock is validated on quote and payment initiation, with no client price override', async t => {
  const f = await fixture(t);
  for (const stock of [1, 0, -1]) {
    await db.doc('products/1').update({ stock });
    assert.equal((await f.call('/orders', request({ idempotencyKey: `stock-limit-checkout-${stock}` }))).status, 409);
    assert.equal((await f.start()).status, 409);
  }
  assert.equal(f.calls.length, 0);
  await db.doc('products/1').update({ stock: 10, published: false });
  assert.equal((await f.start()).status, 409);
});

test('concurrent verified callbacks deduct inventory once and preserve the audit', async t => {
  const f = await fixture(t); await f.start(); f.change('COMPLETE');
  const results = await Promise.all(Array.from({ length: 4 }, () => f.call('/payments/intasend/webhook', { api_ref: f.calls[0].api_ref, challenge }, null)));
  assert.ok(results.every(r => r.status === 200));
  assert.equal((await db.doc('products/1').get()).data().stock, 8);
  assert.equal((await db.collection('inventoryMovements').get()).size, 1);
  assert.equal((await f.saved()).inventoryStatus, 'deducted');
  const movement = (await db.collection('inventoryMovements').get()).docs[0].data();
  assert.equal(movement.orderId, f.orderId); assert.equal(movement.previousQuantity, 10); assert.equal(movement.newQuantity, 8);
  f.change('FAILED'); await f.refresh(); assert.equal((await db.doc('products/1').get()).data().stock, 8);
});

test('a payment received after stock runs out is recorded without negative stock or dispatch', async t => {
  const f = await fixture(t); await f.start();
  await db.doc('products/1').update({ stock: 1 });
  f.change('COMPLETE'); assert.equal((await f.refresh()).body.paymentVerified, true);
  assert.equal((await f.saved()).inventoryStatus, 'review');
  assert.equal((await db.doc('products/1').get()).data().stock, 1);
  assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, { orderStatus: 'shipped' }, 'admin', 'PATCH')).status, 409);
  assert.equal((await db.collection('inventoryMovements').get()).size, 0);
});

test('cancelled orders cannot restart payment; late verified payments require reconciliation', async t => {
  const f = await fixture(t); await f.start();
  assert.equal((await f.call(`/orders/${f.orderId}/cancel`, {}, 'bob')).status, 404);
  assert.equal((await f.call(`/orders/${f.orderId}/cancel`)).status, 200);
  assert.equal((await f.start()).status, 409);
  f.change('COMPLETE'); await f.refresh();
  const order = await f.saved();
  assert.equal(order.orderStatus, 'cancelled'); assert.equal(order.paymentVerified, true); assert.equal(order.refundReviewRequired, true);
  assert.equal((await db.doc('products/1').get()).data().stock, 10);
});

test('failed payment stays unpaid, retry resumes one checkout, and ready/dispatch/delivered history is recorded', async t => {
  const f = await fixture(t); await f.start(); f.change('FAILED'); await f.refresh();
  assert.equal((await f.saved()).paymentStatus, 'failed'); assert.equal((await db.doc('products/1').get()).data().stock, 10);
  assert.equal((await f.start()).status, 200); assert.equal(f.calls.length, 1);
  f.change('COMPLETE'); await f.refresh();
  for (const status of ['ready', 'shipped', 'completed']) assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, { orderStatus: status }, 'admin', 'PATCH')).status, 200);
  const history = (await db.collection('fulfilmentEvents').get()).docs.map(d => d.data());
  assert.equal(history.length, 4); assert.ok(history.every(e => e.actor && e.from && e.to && e.createdAt));
  await assertSucceeds(getDocs(query(collection(rules.authenticatedContext('alice').firestore(), 'fulfilmentEvents'), where('orderId', '==', f.orderId))));
});

test('blog drafts are private; publish, unpublish and archive use admin validation', async t => {
  const f = await fixture(t), publicDb = rules.unauthenticatedContext().firestore(), customer = rules.authenticatedContext('alice').firestore(), admin = rules.authenticatedContext('admin').firestore();
  assert.equal((await f.call('/admin/news/article', postInput(), 'alice')).status, 403);
  assert.equal((await f.call('/admin/news/article', postInput(), 'admin')).status, 200);
  await assertFails(getDoc(doc(publicDb, 'news/article'))); await assertSucceeds(getDoc(doc(admin, 'news/article')));
  await assertFails(setDoc(doc(customer, 'news/hack'), postInput({ status: 'published' })));
  await assertFails(updateDoc(doc(admin, 'news/article'), { status: 'published' }));
  assert.equal((await f.call('/admin/news/article', postInput({ version: 1, status: 'published' }), 'admin')).status, 200);
  await assertSucceeds(getDoc(doc(publicDb, 'news/article')));
  assert.equal((await getDocs(query(collection(publicDb, 'news'), where('status', '==', 'published')))).size, 1);
  assert.equal((await f.call('/admin/news/article', postInput({ version: 2, status: 'draft' }), 'admin')).status, 200);
  await assertFails(getDoc(doc(publicDb, 'news/article')));
  assert.equal((await f.call('/admin/news/article', postInput({ version: 3, status: 'archived' }), 'admin')).status, 200);
  await assertFails(getDoc(doc(publicDb, 'news/article')));
});

test('video hosts, publication dates, media and slugs are strictly validated', async t => {
  const f = await fixture(t);
  for (const videoUrl of ['javascript:alert(1)', 'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', 'http://youtu.be/dQw4w9WgXcQ', 'https://user@youtube.com/watch?v=dQw4w9WgXcQ', 'https://vimeo.com/../../private']) {
    assert.equal((await f.call('/admin/news/video', postInput({ mediaType: 'video', videoUrl }), 'admin')).status, 400);
  }
  for (const patch of [{ publishedDate: '2099-01-01' }, { publishedDate: '2026-02-31' }, { image: '' }, { content: '' }, { slug: '../draft' }]) assert.equal((await f.call('/admin/news/video', postInput({ status: 'published', ...patch }), 'admin')).status, 400);
  assert.equal((await f.call('/admin/news/video', postInput({ mediaType: 'video', videoUrl: 'https://youtu.be/dQw4w9WgXcQ', status: 'published' }), 'admin')).status, 200);
  assert.equal((await db.doc('news/video').get()).data().embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal((await f.call('/admin/news/video', postInput({ version: 1, mediaType: 'video', videoUrl: 'https://vimeo.com/123456789', status: 'published' }), 'admin')).status, 200);
  assert.equal((await db.doc('news/video').get()).data().embedUrl, 'https://player.vimeo.com/video/123456789');
});


test('Storage allows admin image creation but denies customer uploads, unsafe types and overwrite', async () => {
  const admin = rules.authenticatedContext('admin').storage('gs://demo-topheights-tests.appspot.com');
  const customer = rules.authenticatedContext('alice').storage('gs://demo-topheights-tests.appspot.com');
  const bytes = new Uint8Array([137, 80, 78, 71]);
  await assertFails(uploadBytes(ref(customer, 'commerce/products/customer-file'), bytes, { contentType: 'image/png' }));
  await assertFails(uploadBytes(ref(admin, 'commerce/products/script'), bytes, { contentType: 'image/svg+xml' }));
  await assertFails(uploadBytes(ref(admin, 'commerce/other/file'), bytes, { contentType: 'image/png' }));
  await assertSucceeds(uploadBytes(ref(admin, 'commerce/products/admin-image'), bytes, { contentType: 'image/png' }));
  await assertSucceeds(getBytes(ref(customer, 'commerce/products/admin-image')));
  await assertFails(uploadBytes(ref(admin, 'commerce/products/admin-image'), bytes, { contentType: 'image/png' }));
});


test('published pages have escaped server metadata, private pages return 404 and sitemap excludes drafts', async t => {
  const f = await fixture(t);
  await f.call('/admin/news/article', postInput(), 'admin');
  await f.call('/admin/products/new', productInput(), 'admin');
  assert.equal((await f.call('/blog/solar-advice', {}, null, 'GET')).status, 404);
  assert.equal((await f.call('/shop/test-inverter', {}, null, 'GET')).status, 404);
  await f.call('/admin/news/article', postInput({ version: 1, status: 'published' }), 'admin');
  await f.call('/admin/products/new', productInput({ version: 1, status: 'active', published: true }), 'admin');
  const page = await f.call('/blog/solar-advice', {}, null, 'GET');
  assert.equal(page.status, 200); assert.equal(page.cache, 'no-store');
  assert.match(page.text, /og:title/); assert.match(page.text, /BlogPosting/); assert.match(page.text, /rel="canonical"/);
  assert.match(page.text, /&lt;script&gt;not executed&lt;\/script&gt;/); assert.ok(!page.text.includes('<script>not executed</script>'));
  const product = await f.call('/shop/test-inverter', {}, null, 'GET');
  assert.equal(product.status, 200); assert.match(product.text, /"@type":"Product"/);
  const sitemap = await f.call('/sitemap.xml', {}, null, 'GET');
  assert.match(sitemap.text, /\/blog\/solar-advice/); assert.match(sitemap.text, /\/shop\/test-inverter/);
  await f.call('/admin/news/article', postInput({ version: 2, status: 'archived' }), 'admin');
  assert.equal((await f.call('/blog/solar-advice', {}, null, 'GET')).status, 404);
  assert.ok(!(await f.call('/sitemap.xml', {}, null, 'GET')).text.includes('/blog/solar-advice'));
});

test('stock exception allocation is admin-only and cannot deduct a paid order twice', async t => {
  const f = await fixture(t); await f.start(); await db.doc('products/1').update({stock: 1}); f.change('COMPLETE'); await f.refresh();
  assert.equal((await f.call(`/orders/${f.orderId}/allocate-stock`)).status, 403);
  assert.equal((await f.call(`/orders/${f.orderId}/allocate-stock`, {}, 'admin')).status, 409);
  await db.doc('products/1').update({stock: 5});
  const results = await Promise.all([f.call(`/orders/${f.orderId}/allocate-stock`, {}, 'admin'), f.call(`/orders/${f.orderId}/allocate-stock`, {}, 'admin')]);
  assert.ok(results.every(r => r.status === 200));
  assert.equal((await db.doc('products/1').get()).data().stock, 3);
  assert.equal((await db.collection('inventoryMovements').get()).size, 1);
  await f.refresh(); assert.equal((await db.doc('products/1').get()).data().stock, 3);
  assert.equal((await f.call(`/orders/${f.orderId}/fulfilment`, {orderStatus:'ready'}, 'admin', 'PATCH')).status, 200);
});
