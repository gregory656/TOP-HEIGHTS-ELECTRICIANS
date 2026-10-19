const { test } = require('node:test');
const assert = require('node:assert/strict');
const { intasendProvider } = require('../lib/intasend');

const key = (kind, environment = 'test') => `IS${kind}Key_${environment}_fixture-only`;

test('checkout uses the documented API and publishable header without disclosing its secret', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ id: 'checkout-1', signature: 'signature-1', url: 'https://sandbox.intasend.com/checkout/1/' }));
  });
  const provider = intasendProvider('sandbox', key('Pub'), key('Secret'));
  const result = await provider.create({ amount: '100.00', currency: 'KES', api_ref: 'order-1' });
  assert.equal(result.id, 'checkout-1');
  assert.equal(calls[0].url, 'https://api.intasend.com/api/v1/checkout/');
  assert.equal(calls[0].options.headers['X-IntaSend-Public-API-Key'], key('Pub'));
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(calls[0].options.body.includes(key('Secret')), false);
  assert.equal(calls[0].options.redirect, 'error');
});

test('status verifies the stored checkout using server-side credentials', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.intasend.com/api/v1/payment/status/');
    assert.equal(options.headers.Authorization, `Bearer ${key('Secret')}`);
    assert.deepEqual(JSON.parse(options.body), { invoice_id: '', checkout_id: 'stored-checkout', signature: 'stored-signature', public_key: key('Pub') });
    return new Response(JSON.stringify({ invoice: { state: 'COMPLETE' } }));
  });
  const result = await intasendProvider('sandbox', key('Pub'), key('Secret')).status({ checkoutId: 'stored-checkout', signature: 'stored-signature' });
  assert.equal(result.invoice.state, 'COMPLETE');
});

test('a verified stored invoice is queried using the current provider contract', async t => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { invoice_id: 'invoice-123', public_key: key('Pub') });
    return new Response(JSON.stringify({ invoice: { invoice_id: 'invoice-123', state: 'COMPLETE' } }));
  });
  const result = await intasendProvider('sandbox', key('Pub'), key('Secret')).status({ checkoutId: 'checkout', signature: 'signature', invoiceId: 'invoice-123' });
  assert.equal(result.invoice.invoice_id, 'invoice-123');
});

test('missing or mixed test/live keys cannot initiate a provider request', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw Error('Should not contact provider'); });
  for (const [mode, pub, secret] of [['sandbox', key('Pub', 'live'), key('Secret', 'live')], ['live', key('Pub'), key('Secret')], ['sandbox', key('Pub'), key('Secret', 'live')], ['sandbox', '', key('Secret')]]) {
    await assert.rejects(intasendProvider(mode, pub, secret).create({}), { status: 503 });
  }
  assert.equal(mock.mock.callCount(), 0);
});

test('provider errors never expose its response or credentials', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Private upstream details', { status: 503 }));
  await assert.rejects(intasendProvider('sandbox', key('Pub'), key('Secret')).status({ checkoutId: 'checkout', signature: 'signature' }), error => {
    assert.equal(error.status, 502);
    assert.equal(error.message.includes('Private upstream'), false);
    assert.equal(error.message.includes(key('Secret')), false);
    return true;
  });
});
