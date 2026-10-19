# Vercel production handover

Keep the existing Vercel project and domain. PR #5 supplies a Vite frontend plus one Node.js API function. No DNS migration is needed.

## 1. Import private environment files

Lawrence supplies these files privately, outside GitHub:

- .local/vercel-production.env: import into **Production only**. Includes real production Firebase web config, service-account JSON, Cloudinary credentials, live IntaSend keys/challenge, COMMERCE_ENVIRONMENT=production, STOREFRONT_ORIGIN=https://topheightselectricals.com and **PAYMENTS_ENABLED=true**, as requested.
- .local/vercel-preview.env: import into **Preview only**. Uses the separate staging Firebase project and disabled payments. Preview origin/API are derived from Vercel's deployment URL.

In the existing project, open Settings → Environment Variables → Import .env. Select the correct environment for each file. Store server secrets as Sensitive. Never add Production credentials to Preview or prefix server secrets with VITE_. Do not upload credential files as public assets or attach them to the PR. Existing chatbot VITE_CHAT_API_URL can be retained if separately configured.

Server variables: FIREBASE_SERVICE_ACCOUNT_JSON, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, INTASEND_PUBLIC_KEY, INTASEND_SECRET_KEY, INTASEND_WEBHOOK_CHALLENGE, COMMERCE_ENVIRONMENT, STOREFRONT_ORIGIN, PAYMENTS_ENABLED.

Public frontend variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, optional VITE_FIREBASE_MEASUREMENT_ID; VITE_USE_FIREBASE_EMULATORS=false, VITE_IMAGE_UPLOAD_PROVIDER=cloudinary, VITE_IMAGE_UPLOADS_ENABLED=true. Build script derives API URL, site URL and indexing from the environment.

## 2. Production data blockers found on 19 October 2026

A production check found **zero product documents**. The business-approved catalogue/prices/stock must be populated before the updated storefront can sell. Lawrence subsequently approved free delivery; production settings/global.shippingFee was saved and verified as **0 KES**. Do not copy the KES 10 sandbox test product or staging seed data into production.

## 3. Project settings and data

Use Node.js 22, Framework Vite, project root repository root, output dist. vercel.json sets install and build commands plus API/product/article rewrites; remove conflicting dashboard overrides. The install command installs both root and backend/functions dependencies. No Firebase Functions, Storage or billing upgrade is required for this adapter. Keep the existing Vercel plan; confirm its terms/limits with the project owner.

Before production traffic, back up existing Firestore rules and review/deploy backend/firestore.rules and backend/firestore.indexes.json to **top-heights-electricals** using the owner's authorized Firebase CLI. This blocks browser-written payment/stock changes. Do not overwrite production with staging seed data. Production settings/global.shippingFee is verified as 0 KES (free delivery); check it remains numeric, products have published=true, active=true and valid price/stock, and the approved business user has users/{uid}.role=admin. Existing legacy catalogue records may need deliberate migration through the dashboard. Ensure topheightselectricals.com and www.topheightselectricals.com are authorized Firebase Auth domains.

## 4. Live payment webhook

In the **live** IntaSend account, confirm the merchant/settlement destination belongs to the business, then register:

- Endpoint: https://topheightselectricals.com/api/payments/intasend/webhook
- Event: collection_event
- Challenge: the exact INTASEND_WEBHOOK_CHALLENGE from the private Production environment file

Do not use the sandbox webhook or old exposed keys. M-Pesa checkout is hosted by IntaSend; enabled hosted methods also depend on the merchant's provider settings. The application offers M-Pesa only. A browser return URL never proves payment; the backend queries the authoritative invoice and checks currency, amount and server-generated order reference.

## 5. Review and release

Build the review branch as Preview with its staging environment first. Verify login, admin product/blog/image editing, public product links, cart/checkout, and permissions. Then Gregory can merge PR #5 when satisfied and deploy Production with the Production environment above. Imports affect new deployments, so redeploy after changes. Keep the previous Vercel deployment for rollback.

Production payments are **enabled by configuration**, but completed live settlement has not yet been demonstrated. After deployment, check /api/health, log in with the production account, and perform one separately approved small live payment from a number the tester controls. Confirm the provider invoice is COMPLETE, the order is paid/verified, stock reduces once, and dashboard totals match. Also test a cancelled/timed-out prompt stays unverified and does not reduce stock. Never share an M-Pesa PIN. Do not fulfil orders until verified. If checks fail, set PAYMENTS_ENABLED=false and redeploy or roll back.

Live webhook status: details were forwarded to Gregory; creation and delivery have not yet been confirmed.
