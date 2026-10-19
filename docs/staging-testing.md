# Real-account staging testing

Staging project: `top-heights-staging-408995` (Top Heights Staging).
The production project `top-heights-electricals` is separate.

Run `npm run dev:staging`, then open http://127.0.0.1:5175/admin.
This runs the frontend and commerce API on this computer, using actual Firebase
Authentication and Firestore in the staging project. Keep the terminal running.
Staging records persist after the local server stops. No GitHub push or hosted
website deployment is needed to run this arrangement.

The normal `npm run dev:local` remains the emulator-only mode on port 5174.
Its `@topheights.test` accounts do not authenticate against cloud staging.

## Initial setup

- The staging project and web app have been created. Public web configuration is
  in ignored `.env.staging.local`. The starter rejects any other Firebase project.
- Standard Firebase Authentication is initialized, Email/Password is enabled,
  and `127.0.0.1` and `localhost` are authorized domains.
- Business administrator `lawrencengugi90@gmail.com` is created with
  `users/{uid}.role = admin`. Its generated staging password is in the ignored
  `.local/staging-admin.json`. It is separate from the Google/production password.
- Firestore uses the `(default)` Standard database in `africa-south1`.
- The existing `backend/firestore.rules` were published to **staging only** on
  6 October 2026, following explicit user approval. The command used was:

  ```powershell
  node backend/functions/node_modules/firebase-tools/lib/bin/firebase.js deploy --only firestore:rules --project top-heights-staging-408995
  ```

## Current limits

- On 12 October 2026 the owner initially approved the Firebase Blaze route,
  then reported an unaffordable $50 temporary charge during activation. Do not
  proceed with billing activation or paid provisioning. The latest API check
  reports billing disabled. Retain Spark Authentication/Firestore; the Netlify
  API and Cloudinary image hosting are now deployed and tested. Keep staging data
  isolated in `top-heights-staging-408995`.
- The local API explicitly disables payments. It cannot collect money or mark a
  payment successful. IntaSend sandbox integration remains a separate setup.
- Cloud image uploads now use Cloudinary through the authenticated staging API.
  `VITE_IMAGE_UPLOADS_ENABLED=true` and `VITE_IMAGE_UPLOAD_PROVIDER=cloudinary`
  enable the editors; Cloudinary uploads are limited to supported images below
  3 MB. No Firebase Storage bucket or Blaze activation is required for this route.
- Learning dashboards remain prototypes; the business dashboard is the testing
  target. Products, stock changes, orders and blog records belong to staging.
- Local API credentials come from Firebase CLI's normal credential helper and
  stay outside source control. Sign out of Firebase CLI when access is no longer
  needed. Do not share `.local` or Firebase CLI credential files.

## Acceptance checks

Verified on 6 October 2026: real cloud sign-in, staging API identity, rejection of
anonymous admin writes, product draft/publication, stock adjustment from 3 to 5,
and blog draft/publication. Two clearly named staging example records were left
for manual testing. The checks used the same authenticated API as the dashboard.
The API startup, frontend/backend TypeScript checks and targeted ESLint passed.
Evidence: ignored `.local/staging-api-check.json`.

Browser checks also passed after the approved rules deployment: real-email admin
sign-in; Orders, Products & stock and Blog tabs; saving a product description and
confirming it after reload and on its shop page; saving blog content and confirming
it on the public article page after reload; and retaining the admin session across
navigation. The existing staging demo product/article were used. No production
project was modified, and no GitHub push or hosted website deployment was made.

For further manual testing: sign in with the staging
account, create/edit/archive a product, adjust stock with a reason and check its
history, publish/edit/archive a blog article and check the public page. Reload to
confirm saved records. Sign in separately as a customer to test order quotes and
order visibility. Image-upload and provider-payment checks remain pending the
services described above.

## Release status — 7 October 2026

The IntaSend adapter now uses the provider's current API host and public-key
header, rejects mismatched test/live credentials before making requests, and
keeps upstream error details and secret keys out of browser responses. The
commerce suite passed **38 tests** with no failures or skips. These are automated
checks with a simulated provider; they do not prove an actual payment succeeded.
The production build and full ESLint check also passed on 7 October. The build
still reports the existing large JavaScript bundle advisory. Release logs are
kept locally in `.local/finalize-build.log` and `.local/finalize-lint.log`.

`npm run firebase -- <command>` invokes the installed project-local Firebase CLI;
no global `firebase` command is required. `npm run build:staging` now requires
explicit `STAGING_SITE_URL` and `STAGING_API_URL` HTTPS endpoints and preserves the
configured upload flag. It does not provision hosting, enable billing, or deploy.

Pending external setup: an API host reachable over HTTPS, image hosting, fresh
IntaSend sandbox credentials and a registered webhook. Keep secrets in private
server environment settings, never in chat, Git, or `VITE_` variables. Actual
upload and provider callback acceptance checks are still required before launch.

## M-Pesa-only checkout — 9 October 2026

New orders use M-Pesa only. The separate IntaSend card/bank selector is removed
and the API rejects new non-M-Pesa orders. Existing order history and payment
verification remain available; unpaid older card/bank orders cannot start another
payment. The existing gateway is retained. Its current flow opens hosted checkout
to request the phone prompt; a real STK request and callback have not been tested.
No direct Safaricom Daraja integration has been added. Local staging still
explicitly disables payment requests and never treats an unpaid order as paid.

Product and article editors accept existing HTTPS image URLs or site image paths.
The API no longer requires remote images to be stored in Firebase; unsafe schemes,
URL credentials and custom ports remain rejected. This does not enable file
uploads or provision image hosting.

The 8 October build/lint/test run was interrupted by a drive disconnection and
must not be counted as a pass. The saved changes were found intact on 9 October.
All work remains local on `feat/commerce-launch`. No billing, Git push, website
deployment, live payment or production-data change is included.

Verification completed on 9 October: 41 automated checks passed, production build
passed, full lint plus the final changed-file lint passed, and credential/whitespace
checks passed. Browser checks confirmed real-email admin sign-in, M-Pesa-only
checkout, a KES 1,000 order for Voi appearing in both customer and admin views,
zero verified sales for the unpaid order, product/image replacement and publication
persisting after reload. A deliberately disabled payment request returned 503.
Only clearly named staging example records were used. The analytics startup now
skips initialization when no measurement ID is configured.

Evidence: .local/mpesa-only-tests.log, .local/mpesa-only-build.log and
.local/mpesa-only-lint.log. Test order reference:
a2bfd48fc9374106f98f4fb3ee29e3ac4d8fa319. Live payment processing and file uploads
remain unconfigured; image URL/site-path editing is available. No production
changes, Git push or website deployment were performed.

## Firebase staging rollout — 12 October 2026

The owner approved completing staging on Firebase rather than migrating the API
and images to other hosts. Production and the original GitHub repository remain
outside this deployment. The API scales to zero when idle and allows at most two
instances; this limits compute concurrency, not the total bill. Configure billing
alerts and applicable service spending caps before opening the preview to traffic.

Hosted build preparation (PowerShell):

```powershell
$env:STAGING_SITE_URL='https://top-heights-staging-408995.web.app'
$env:STAGING_API_URL='https://us-central1-top-heights-staging-408995.cloudfunctions.net/api'
$env:VITE_IMAGE_UPLOADS_ENABLED='true'
npm run build:staging
```

This builds locally and does not enable billing or deploy. Before deploying,
provision the staging Storage bucket, configure the function's required secrets,
and deploy Storage rules including the Firestore lookup permission used for
administrator uploads. Keep the sandbox public payment key empty until merchant
setup is complete so content testing cannot start a payment. Do not reuse the
historically exposed merchant secret.

Then deploy only the staging project's Functions, Hosting and security rules.
Verify actual dashboard upload/save/reload/publication and unauthorized-upload
rejection before moving to a provider payment test. The existing adapter uses
IntaSend hosted checkout for M-Pesa; a direct STK integration is not yet implemented.
An actual provider payment and matching callback/stock/order records remain
required acceptance checks. Merely upgrading billing does not prove these work.

Preparation verified on 12 October: the hosted staging build (including frontend
and backend TypeScript compilation) and changed-file lint passed. Source/bundle
credential scanning and whitespace checks passed. Build evidence is in
`.local/blaze-staging-build.log`; endpoint metadata is in `.local/staging-build.json`.
The API billing check returned `billingEnabled: false`. No bucket, function,
website or payment provider was deployed or enabled in this preparation step.

Later on 12 October, Blaze activation was deferred because of the temporary
charge reported by the owner. Do not deploy the Firebase Functions/Storage
rollout or assume its prerequisites are satisfied. The generated hosted build
targets Firebase endpoints that do not yet exist; it must be rebuilt for any
alternative hosting integration. Netlify/Cloudinary are not connected yet.

## Free-hosted staging verified — 12 October 2026

The alternate build was deployed to the separate Netlify site:
https://top-heights-staging-408995.netlify.app/admin . Its published site visibility
was made public for client review; the business dashboard still requires Firebase
sign-in and an administrator role. Team defaults and the live website were not
changed. The project's Firebase data remains isolated in staging on Spark.

The hosted API uses a dedicated staging service account with datastore.user and
firebaseauth.viewer permissions. Cloudinary credentials and its service account
key are stored in server environment settings, not the client bundle or Git.
The browser bundle was checked against the actual private values; none appeared.
An anonymous hosted upload returned 401. M-Pesa calls remain deliberately disabled.

48 automated checks passed, as did the staging build and changed-file lint.
Hosted browser checks passed for real-email administrator login; a real product
image upload to Cloudinary; saving its description and cover; and displaying the
saved description and loaded image after navigation to its public page. A device
network suspension interrupted the first save response, but its saved record was
confirmed persisted; retrying the old version correctly returned 409.

The article editor also uploaded a real Cloudinary image and saved content with
HTTP 200. Its published page then displayed the new text and loaded image. Only
the clearly labelled staging demo product/article were modified. Existing sandbox
order records were visible in the hosted dashboard. No real payment was requested,
no Git push was performed, and no production site/data was changed.

See `docs/free-hosting-staging.md` for configuration and repeat deployment steps.
Evidence: `.local/free-hosting-tests.log`, `.local/free-hosting-build.log`,
`.local/free-hosting-lint.log`, `.local/netlify-deploy.log` and the ignored hosted
browser snapshots. Payment-provider configuration and actual settlement acceptance
remain outstanding; do not describe M-Pesa as verified.

On 14 October, an approved KES 10 sandbox prompt reached the owner, who reports
completing payment. The real invoice-ID status contract was fixed and deployed;
50 tests and changed-file lint passed. Invoice QPWN5NY still reports PROCESSING,
so its order stays unverified and test stock stays 1. See the approved-test section
in `docs/free-hosting-staging.md`; do not request another charge or mark it paid
without authoritative COMPLETE confirmation. Automatic callback delivery and
actual paid settlement remain pending.
