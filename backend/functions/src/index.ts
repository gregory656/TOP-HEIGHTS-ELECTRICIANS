import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createCommerceApp } from './app';
import { intasendProvider } from './intasend';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

initializeApp();
const secretKey = defineSecret('INTASEND_SECRET_KEY');
const challenge = defineSecret('INTASEND_WEBHOOK_CHALLENGE');
let htmlTemplate: string | undefined;
try { htmlTemplate = readFileSync(join(__dirname, '../storefront.html'), 'utf8'); } catch { /* Local API tests do not require a storefront build. */ }

// Scale to zero when idle and limit concurrent instances during the initial rollout.
export const api = onRequest({ secrets: [secretKey, challenge], timeoutSeconds: 60, minInstances: 0, maxInstances: 2 }, (req, res) => {
  const mode = process.env.INTASEND_MODE === 'live' ? 'live' : 'sandbox';
  const storefront = (process.env.STOREFRONT_ORIGIN || '').replace(/\/+$/, '');
  createCommerceApp({
    db: getFirestore(), verifyToken: token => getAuth().verifyIdToken(token, true),
    provider: intasendProvider(mode, process.env.INTASEND_PUBLIC_KEY || '', secretKey.value()),
    mode, storefront, webhookChallenge: challenge.value(), htmlTemplate, indexable: process.env.SITE_INDEXABLE === 'true',
  })(req, res);
});
