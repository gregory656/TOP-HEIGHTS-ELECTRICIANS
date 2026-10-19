import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type CommerceDependencies } from './app';
import { CommerceError } from './commerce';
import { intasendProvider } from './intasend';
import { cloudinaryUploader } from './media';

export function deploymentConfig(env: NodeJS.ProcessEnv) {
  const environment = env.COMMERCE_ENVIRONMENT || 'staging';
  if (!['staging', 'production'].includes(environment)) throw Error('Invalid commerce environment.');
  const production = environment === 'production';
  const projectId = production ? 'top-heights-electricals' : 'top-heights-staging-408995';
  const storefront = (env.STOREFRONT_ORIGIN || '').replace(/\/+$/, '');
  const url = new URL(storefront);
  if (url.origin !== storefront || url.protocol !== 'https:') throw Error('Configure the HTTPS storefront.');
  if (production && !['topheightselectricals.com', 'www.topheightselectricals.com'].includes(url.hostname)) throw Error('Production requires the approved live domain.');
  return { projectId, storefront, mode: production ? 'live' as const : 'sandbox' as const, indexable: production };
}
export function runtimeDependencies(env: NodeJS.ProcessEnv, host: string): CommerceDependencies {
  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  const { projectId, storefront, mode, indexable } = deploymentConfig(env);
  if (serviceAccount.project_id !== projectId) throw Error('Firebase credentials do not match this deployment.');
  if (env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_AUTH_EMULATOR_HOST) throw Error('Hosted emulator configuration refused.');
  const appName = `${host}-${mode}`;
  const app = getApps().find(item => item.name === appName) || initializeApp({ projectId, credential: cert(serviceAccount) }, appName);
  const unavailable = () => { throw new CommerceError(503, 'Payments are not enabled. Please contact the shop.'); };
  const paymentsEnabled = env.PAYMENTS_ENABLED === 'true';
  if (paymentsEnabled) {
    intasendProvider(mode, env.INTASEND_PUBLIC_KEY || '', env.INTASEND_SECRET_KEY || '').assertReady();
    if ((env.INTASEND_WEBHOOK_CHALLENGE || '').length < 32) throw Error('Configure the payment webhook challenge.');
  }
  return {
    db: getFirestore(app), verifyToken: token => getAuth(app).verifyIdToken(token, true),
    storefront, mode, indexable,
    provider: paymentsEnabled ? intasendProvider(mode, env.INTASEND_PUBLIC_KEY || '', env.INTASEND_SECRET_KEY || '') : { assertReady: unavailable, create: unavailable, status: unavailable },
    webhookChallenge: paymentsEnabled ? env.INTASEND_WEBHOOK_CHALLENGE || '' : '',
    htmlTemplate: readFileSync(join(process.cwd(), 'backend/functions/storefront.html'), 'utf8'),
    imageUploader: cloudinaryUploader({ cloudName: env.CLOUDINARY_CLOUD_NAME, apiKey: env.CLOUDINARY_API_KEY, apiSecret: env.CLOUDINARY_API_SECRET }),
  };
}
