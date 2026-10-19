// Only the local Firebase emulators can receive these accounts.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
for (const key of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST']) {
  if (!/^127\.0\.0\.1:\d+$/.test(process.env[key] || '')) throw Error(`${key} must point to a local emulator.`);
}
initializeApp({ projectId: 'demo-topheights-commerce' });
const credentialsPath = path.resolve(__dirname, '../../../.local/test-accounts.json');
fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
const saved = fs.existsSync(credentialsPath) ? JSON.parse(fs.readFileSync(credentialsPath, 'utf8')) : {};
const password = saved.password || `Local-${crypto.randomBytes(9).toString('base64url')}!`;
const accounts = [
  { uid: 'test-admin', email: 'admin@topheights.test', name: 'Test Admin', role: 'admin' },
  { uid: 'test-customer', email: 'customer@topheights.test', name: 'Test Customer', role: 'customer' },
  { uid: 'test-student', email: 'student@topheights.test', name: 'Test Student', role: 'customer' },
];
(async () => {
  for (const account of accounts) {
    try { await getAuth().getUser(account.uid); }
    catch (error) { if (error.code !== 'auth/user-not-found') throw error; await getAuth().createUser({ uid: account.uid, email: account.email, password, displayName: account.name, emailVerified: true }); }
    await getAuth().updateUser(account.uid, { password });
    await getFirestore().doc(`users/${account.uid}`).set({ ...account, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  fs.writeFileSync(credentialsPath, JSON.stringify({ localOnly: true, password, accounts }, null, 2));
  console.log('Local test accounts ready. Credentials saved in .local/test-accounts.json.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
