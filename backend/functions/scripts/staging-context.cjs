// This helper can only open this project's isolated staging database.
const path = require('node:path');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getGlobalDefaultAccount } = require('firebase-tools/lib/auth');
const { getCredentialPathAsync } = require('firebase-tools/lib/defaultCredentials');

const projectId = 'top-heights-staging-408995';
const root = path.resolve(__dirname, '../../..');

async function stagingContext() {
  for (const name of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST', 'FIREBASE_STORAGE_EMULATOR_HOST']) {
    if (process.env[name]) throw Error(`Unset ${name} before using cloud staging.`);
  }
  if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== projectId) {
    throw Error('The configured project is not the approved staging project.');
  }
  const account = getGlobalDefaultAccount();
  if (!account) throw Error('Sign in with the project-installed Firebase CLI first.');
  // Use the same credential helper as Firebase's Functions emulator. No key is committed.
  const credentials = await getCredentialPathAsync(account);
  if (!credentials) throw Error('Firebase CLI credentials are unavailable. Sign in again.');
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials;
  process.env.GCLOUD_PROJECT = projectId;
  const app = initializeApp({ projectId, credential: applicationDefault() });
  return { app, auth: getAuth(app), db: getFirestore(app), projectId };
}

module.exports = { stagingContext, projectId, root };
