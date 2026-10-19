// Local order API: real emulator authentication and records, no provider/payment calls.
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { createCommerceApp } = require('../lib/app');
const { CommerceError } = require('../lib/commerce');
for (const key of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST']) {
  if (!/^127\.0\.0\.1:\d+$/.test(process.env[key] || '')) throw Error(`${key} must point to a local emulator.`);
}
initializeApp({ projectId: 'demo-topheights-commerce' });
const unavailable = () => { throw new CommerceError(503, 'Payments are disabled in local testing. IntaSend sandbox setup is required; no payment has been requested.'); };
createCommerceApp({ db: getFirestore(), verifyToken: token => getAuth().verifyIdToken(token), mode: 'sandbox',
  storefront: 'http://127.0.0.1:5174', webhookChallenge: '',
  provider: { assertReady: unavailable, create: unavailable, status: unavailable },
}).listen(5002, '127.0.0.1', () => console.log('Local order API ready; payments disabled.'));
