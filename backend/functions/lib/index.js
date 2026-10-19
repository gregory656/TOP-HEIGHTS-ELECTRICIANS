"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const app_2 = require("./app");
const intasend_1 = require("./intasend");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
(0, app_1.initializeApp)();
const secretKey = (0, params_1.defineSecret)('INTASEND_SECRET_KEY');
const challenge = (0, params_1.defineSecret)('INTASEND_WEBHOOK_CHALLENGE');
let htmlTemplate;
try {
    htmlTemplate = (0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, '../storefront.html'), 'utf8');
}
catch { /* Local API tests do not require a storefront build. */ }
// Scale to zero when idle and limit concurrent instances during the initial rollout.
exports.api = (0, https_1.onRequest)({ secrets: [secretKey, challenge], timeoutSeconds: 60, minInstances: 0, maxInstances: 2 }, (req, res) => {
    const mode = process.env.INTASEND_MODE === 'live' ? 'live' : 'sandbox';
    const storefront = (process.env.STOREFRONT_ORIGIN || '').replace(/\/+$/, '');
    (0, app_2.createCommerceApp)({
        db: (0, firestore_1.getFirestore)(), verifyToken: token => (0, auth_1.getAuth)().verifyIdToken(token, true),
        provider: (0, intasend_1.intasendProvider)(mode, process.env.INTASEND_PUBLIC_KEY || '', secretKey.value()),
        mode, storefront, webhookChallenge: challenge.value(), htmlTemplate, indexable: process.env.SITE_INDEXABLE === 'true',
    })(req, res);
});
