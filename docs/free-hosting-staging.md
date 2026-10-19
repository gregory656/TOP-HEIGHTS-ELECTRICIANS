# Free hosting for staging

Verified on 12 October 2026: real-email admin sign-in, product and article image
uploads to Cloudinary, saved content appearing on published pages, anonymous-upload
rejection, and absence of server secrets in the browser bundle. All 48 automated
checks passed. Netlify's default team-login protection was disabled only for this
staging site's public URL; Firebase still protects administrative access. Payments
remain disabled pending merchant setup.

This deployment uses Firebase Spark Authentication/Firestore, Netlify Free for
the storefront and API, and Cloudinary Free for images. It does not deploy to the
production Firebase project, change the live domain, enable Blaze or push Git.

- Staging Firebase project: `top-heights-staging-408995`
- Netlify site ID: `9b8ca712-3f9b-4e01-82de-0dbd86d3f38b`
- Site: https://top-heights-staging-408995.netlify.app
- Admin: https://top-heights-staging-408995.netlify.app/admin
- API: https://top-heights-staging-408995.netlify.app/api

## Configuration

The Netlify runtime requires `FIREBASE_SERVICE_ACCOUNT_JSON`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` and
`STOREFRONT_ORIGIN`. These belong in server environment settings, never `VITE_`
variables, Git, screenshots or chat. The staging service account has only
`roles/datastore.user` and `roles/firebaseauth.viewer`; the adapter rejects
credentials from any other Firebase project.

`PAYMENTS_ENABLED=false` keeps real provider calls disabled during content tests.
The staging adapter uses sandbox payment mode and always returns noindex metadata.
It requires a deliberate code/configuration review before use in production.

Private setup files are in ignored `.local/`; `.netlify/` is also ignored.
The local API reads `.local/free-hosting.env` for its Cloudinary configuration.
For local testing, use `npm run dev:staging` with image uploads enabled and
`VITE_IMAGE_UPLOAD_PROVIDER=cloudinary` in `.env.staging.local`.

Uploads require authenticated business-admin access. The API accepts JPG, PNG,
WebP and GIF files below 3 MB, validates their headers, and uploads them to unique
Cloudinary paths without overwriting existing assets. The Cloudinary secret stays
on the server. Saving a product/article attaches the resulting URL to its record.
Archiving content does not automatically delete its media from Cloudinary.

## Manual deployment without a Git push

```powershell
$env:STAGING_SITE_URL='https://top-heights-staging-408995.netlify.app'
$env:STAGING_API_URL='https://top-heights-staging-408995.netlify.app/api'
npm run build:staging
npx netlify-cli deploy --site 9b8ca712-3f9b-4e01-82de-0dbd86d3f38b --prod --no-build --dir dist --functions netlify/functions
```

`--prod` publishes to this separate Netlify staging site's main URL. It does not
mean the client's live website. Confirm the site ID before every deploy. Keep the
accounts on their free plans; limits may pause service. This configuration does
not promise unlimited free traffic or free M-Pesa transactions.

The local build requires installed dependencies in the root and
`backend/functions`. For a future Git-connected build, also supply the public
`VITE_FIREBASE_*` configuration, `VITE_USE_FIREBASE_EMULATORS=false`,
`VITE_IMAGE_UPLOADS_ENABLED=true`, `VITE_IMAGE_UPLOAD_PROVIDER=cloudinary`, and the
two `STAGING_*` URLs in build environment settings. A static ZIP alone omits the API.

## Payment follow-up

### Approved KES 10 test — 14 October 2026

The owner approved one KES 10 request to their nominated Safaricom number. The
staging-only product `staging-mpesa-10` has initial stock 1. Order
`3811c1705d382f8781f5a3b3df74e38eebaa901f` and its provider checkout both total
exactly KES 10 with no shipping fee. One M-Pesa prompt was submitted; the owner
reports receiving and completing it. Do not automatically request another charge.

Hosted sandbox requests are now enabled. The free Netlify plan requires default
env scopes; verify setting updates before deployment. The local runner remains
payment-disabled, and no live payment environment was enabled.

The real status API required an invoice ID. The corrected webhook treats that ID
only as a lookup hint: server-side provider confirmation must match its invoice
ID, exact amount/currency and random order reference before settlement. Verified
invoice IDs persist for refreshes. All 50 regression checks and changed-file lint
passed, including invoice-hint mismatch and replay cases; the fix is deployed.

Invoice `QPWN5NY` matches the order but the provider still reports PROCESSING.
The corrected callback route was manually exercised for this same invoice and
returned 200; this does not prove automatic webhook delivery. The latest refresh
shows processing/unverified, stock 1, inventory not_deducted. Paid settlement and
automatic completion delivery remain unverified. Never mark it paid manually.

Evidence: `.local/mpesa-test-10.json`, `.local/mpesa-test-status.json`,
`.local/mpesa-invoice-tests.log`, `.local/mpesa-invoice-lint.log` and
`.local/mpesa-invoice-deploy.log`. Await provider confirmation for this invoice.

On 14 October 2026, both saved keys passed the sandbox-prefix validation and
IntaSend accepted a read-only wallet authentication request (HTTP 200). The keys
and webhook challenge were imported into the isolated Netlify site's server
settings. `PAYMENTS_ENABLED=false` remains in effect. No payment request was made.
The owner reports the sandbox webhook is configured; actual callback acceptance
and paid-order settlement are still pending an approved test amount/phone and
deployment with sandbox payment requests enabled.

Fresh merchant credentials and the provider webhook are still needed. The existing
IntaSend adapter opens hosted M-Pesa checkout; it is not a direct Daraja STK flow.
Do not report a payment as working until the actual provider and callback have
been tested with the owner's approval and matching order, transaction and stock
records have been checked. Never reuse the previously exposed merchant secret.
