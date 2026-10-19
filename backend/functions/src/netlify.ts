import express from 'express';
import serverless from 'serverless-http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCommerceApp, type CommerceDependencies } from './app';
import { CommerceError } from './commerce';
import { intasendProvider } from './intasend';
import { cloudinaryUploader } from './media';

export function createNetlifyHandler(deps: CommerceDependencies) {
  const app = express();
  const commerce = createCommerceApp(deps);
  app.use('/api', commerce);
  app.use('/.netlify/functions/api', commerce);
  app.use(commerce); // Product/blog HTML rewrites preserve the original path.
  return serverless(app);
}

let cached: ReturnType<typeof createNetlifyHandler> | undefined;
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
export const handler: ReturnType<typeof createNetlifyHandler> = async (event, context) => {
  try {
    if (!cached) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
      const { projectId, storefront, mode, indexable } = deploymentConfig(process.env);
      if (serviceAccount.project_id !== projectId) throw Error('Firebase credentials do not match this deployment.');
      const appName = `netlify-${mode}`;
      const app = getApps().find(item => item.name === appName) || initializeApp({ projectId, credential: cert(serviceAccount) }, appName);
      const unavailable = () => { throw new CommerceError(503, 'Payments are not enabled. Please contact the shop.'); };
      const paymentsEnabled = process.env.PAYMENTS_ENABLED === 'true';
      cached = createNetlifyHandler({
        db: getFirestore(app), verifyToken: token => getAuth(app).verifyIdToken(token, true),
        storefront, mode, indexable,
        provider: paymentsEnabled ? intasendProvider(mode, process.env.INTASEND_PUBLIC_KEY || '', process.env.INTASEND_SECRET_KEY || '') : { assertReady: unavailable, create: unavailable, status: unavailable },
        webhookChallenge: paymentsEnabled ? process.env.INTASEND_WEBHOOK_CHALLENGE || '' : '',
        htmlTemplate: readFileSync(join(process.cwd(), 'backend/functions/storefront.html'), 'utf8'),
        imageUploader: cloudinaryUploader({ cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY, apiSecret: process.env.CLOUDINARY_API_SECRET }),
      });
    }
    return await cached(event, context);
  } catch {
    return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'The service is not configured yet.' }) };
  }
};
