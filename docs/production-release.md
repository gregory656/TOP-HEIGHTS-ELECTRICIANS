# Production release preparation — 19 October 2026

- Production frontend: ignored .env.production.local, Firebase top-heights-electricals.
- Production build: PRODUCTION_SITE_URL=https://topheightselectricals.com and PRODUCTION_API_URL=https://topheightselectricals.com/api; npm run build:production.
- Live hosting stays on Vercel. The existing Netlify adapter/configuration remains for staging; netlify.production.toml is an optional prepared configuration, not the selected live deployment. The Vercel backend entry point and routing are included; see vercel-handover.md.
- Backend requires COMMERCE_ENVIRONMENT=production, STOREFRONT_ORIGIN=https://topheightselectricals.com, production FIREBASE_SERVICE_ACCOUNT_JSON, Cloudinary server credentials, and the live IntaSend credentials. The private Vercel Production handover now sets PAYMENTS_ENABLED=true as explicitly requested; no deployment or charge has occurred.
- Live webhook endpoint: https://topheightselectricals.com/api/payments/intasend/webhook; collection_event; challenge from the private production environment file. Configure it in the live IntaSend account, not sandbox. Endpoint is not deployed yet.
- Production admin role verified for lawrencengugi90@gmail.com; password was not changed or verified.
- Production service-account JSON was supplied privately and verified for Authentication and Firestore reads. It stays in ignored .local/netlify-production-firebase-service-account.json; never Git.
- Hosting target confirmed: existing Vercel project. Gregory will import the private Production/Preview environment files and deploy on the existing Vercel project. No DNS change, production deployment, or live charge has occurred.
- Before enabling sales: validate deployed login, content permissions and upload, inspect production catalogue/schema and rules, confirm merchant ownership/destination, register live webhook, approve one live test amount and number, and verify settlement plus stock exactly once. Keep prior deployment available for rollback.
