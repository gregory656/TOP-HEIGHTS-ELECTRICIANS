// Real staging accounts and cloud records, with the API running on this computer.
const { stagingContext } = require('./staging-context.cjs');
const { createCommerceApp } = require('../lib/app');
const { CommerceError } = require('../lib/commerce');
const { cloudinaryUploader } = require('../lib/media');
const fs = require('node:fs');
const path = require('node:path');
const mediaConfig = path.resolve(__dirname, '../../../.local/free-hosting.env');
if (fs.existsSync(mediaConfig)) process.loadEnvFile(mediaConfig);

(async () => {
  const { auth, db, projectId } = await stagingContext();
  await db.doc('settings/global').get(); // Fail at startup if staging is unreachable.
  const unavailable = () => {
    throw new CommerceError(503, 'Payments are disabled in this staging session. No payment has been requested.');
  };
  const app = createCommerceApp({
    db, verifyToken: token => auth.verifyIdToken(token, true),
    mode: 'sandbox', storefront: 'http://127.0.0.1:5175', webhookChallenge: '',
    provider: { assertReady: unavailable, create: unavailable, status: unavailable },
    imageUploader: cloudinaryUploader({ cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY, apiSecret: process.env.CLOUDINARY_API_SECRET }),
  });
  app.get('/staging-health', (_req, res) => res.json({ projectId, environment: 'staging', paymentsEnabled: false }));
  const server = app.listen(5003, '127.0.0.1', () => console.log(`Staging API: ${projectId}; payments disabled.`));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
})().catch(error => { console.error(error.message); process.exitCode = 1; });
