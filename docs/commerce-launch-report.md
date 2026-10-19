# UI and commerce review candidate — 19 October 2026

This branch contains the UI revamp, product detail pages, business-admin catalogue/blog/inventory/order management, and server-verified IntaSend payment integration. It is a review candidate, not a completed production deployment.

Current verification supersedes the historical sprint notes below: staging admin content editing and Cloudinary image uploads were exercised on the separate Netlify staging site. Invoice QPWN5NY remained PROCESSING and unverified; the test does not establish a completed payment or a successful automatic callback. Production Firebase credentials were validated privately and the approved business-admin role was configured; the user's password was not tested. Live payments remain disabled.

The existing live site is hosted on Vercel and will stay there. The included serverless adapter is for Netlify staging; Vercel still needs its backend entry point/routing and production environment configuration before release. Do not merge into an automatically deployed production branch until those deployment requirements and production rules/catalogue compatibility have been reviewed. No secrets, private credential files, or local account passwords belong in this PR.

See [production release preparation](production-release.md). The notes below are retained as historical implementation detail; their deployment status and test counts are not current.

---

# Commerce launch sprint handover — 24 September 2026

> Updated 7 October 2026: real-email staging login and dashboard content edits
> have passed against `top-heights-staging-408995`. Staging Firestore rules were
> deployed with approval; production and GitHub are unchanged. The payment adapter
> was updated and the commerce suite now passes 38 tests. Billing stays disabled.
> Actual cloud image uploads and IntaSend payment/callback testing remain blocked
> by external service configuration. See [current staging status](staging-testing.md)
> for the setup that supersedes the Firebase-only deployment instructions below.

## 1. Executive summary

The fork now contains a connected business dashboard, managed public catalogue, auditable inventory, order management, blog publishing and technical launch preparation. Work is local on `feat/commerce-launch`. Nothing was committed, pushed or merged, and no website/backend was deployed. Only staging Firestore rules were deployed with approval; the original upstream and live site were not changed.

This is a **staging candidate, not an approved production launch**. The separate Firebase staging project is configured for sign-in and database records. Real IntaSend sandbox acceptance still requires an HTTPS API host, fresh provider credentials and merchant-dashboard access. Temporary stock reservations are not implemented; the explicitly permitted transactional-deduction fallback is used.

The existing UI and payment work was preserved. Local backups are `.local/pre-commerce-sprint.patch` and `.local/pre-commerce-sprint-new-files.zip`; keep them private because the historical diff may contain removed credentials. No root/parent AGENTS.md was found. GitHub metadata confirmed `CreatorLarry/TOP-HEIGHTS-ELECTRICIANS` is a fork of `gregory656/TOP-HEIGHTS-ELECTRICIANS`.

## 2. Features completed

- Business overview: active, out-of-stock and low-stock products; pending/paid orders; awaiting dispatch; verified live gross sales. Sandbox, failed, pending and unverified records do not count as sales.
- Product creation/editing, private drafts, preview, publication/unpublication, archive, selling status, SKU/slug uniqueness, category, descriptions, specifications, featured flag, comparison price and multiple images. Published products feed the home/shop/detail pages; the old fallback catalogue is no longer silently shown to customers.
- Stock in/out, correction, damaged and returned stock; required notes; nonnegative quantities; movement history with actor, timestamp and previous/new quantities. Transactions, request IDs and record versions protect adjustments and concurrent edits. Existing quantities can only change through the stock flow.
- Server price/quantity/shipping validation before quoting; stock rechecked before opening a payment session. Product/cart quantities are capped in the UI and enforced by the server.
- Verified payments atomically update payment state and inventory once. Duplicate and late callbacks cannot deduct stock twice. Insufficient stock after payment is flagged for review and blocks dispatch; admins can allocate newly available stock through a guarded transactional action.
- Search orders by reference, customer, phone or provider invoice; filter payment, fulfilment and date. Details include customer, town, optional landmark, items, delivery fee, payment method/reference/verification, timestamps and status history.
- Fulfilment labels: New, Processing, Ready for dispatch, Dispatched, Delivered, Cancelled. Payment status remains separate. No admin action can mark an order paid. Unpaid customers can cancel; paid cancellations flag manual refund/stock reconciliation.
- Blog drafts, preview, publish/unpublish/archive, dates, author/category/tags, SEO fields, image upload/replacement and validated YouTube/Vimeo links. `/blog` and `/blog/:slug` show published content only; `/news` redirects to `/blog`. Content is plain text, not raw executable HTML.
- Product/article metadata, canonical/social tags, structured data and server-rendered HTML through Firebase Hosting rewrites. Dynamic `/sitemap.xml` includes published records. Unpublished server routes return 404. Staging defaults to noindex.
- Firebase web configuration is explicit rather than hardwired to the previous production project. Storage uploads have type/size restrictions and bounded retries. Existing visual-preview aliases remain isolated from live services.

## 3. Intentionally deferred / external blockers

- Actual IntaSend sandbox initiation/completion and webhook delivery: no merchant credentials were supplied. Local payment initiation deliberately returns unavailable; automated tests mock the provider.
- Temporary reservations/expiry workers, automated provider refunds, advanced analytics, delivery-zone pricing and net settlement reconciliation.
- Education/teacher/student functionality and broad SEO campaigns.
- Production activation, Git push and any deployment require your approval.
- The previous preview ZIP has not been regenerated and does not include this sprint. A static Drop ZIP cannot provide the commerce backend or server-rendered metadata routes.

## 4. Files changed

See `commerce-launch-files.txt` for the review manifest, including earlier uncommitted UI work. Main additions/changes:

| Area | Files |
| --- | --- |
| Backend | `backend/functions/src/{app,commerce,catalogue,management,seo,index}.ts` |
| Security/config | `backend/firestore.rules`, `backend/storage.rules`, `backend/firestore.indexes.json`, `firebase.json`, `firebase.test.json`, environment examples |
| Admin | `src/pages/AdminPanel.tsx`, `src/components/admin/{ProductManager,OrderManager,BlogManager,History}.tsx` |
| Storefront | product service/model, `useProducts`, Shop/Home/ProductDetails, ProductActions/ProductCard, cart/checkout |
| Blog/metadata | `Blog.tsx`, `BlogArticle.tsx`, `PageMeta.tsx`, `contentService.ts`, `videoUrl.ts`, navigation/footer |
| Orders | order service/model, OrderActions, Profile |
| Tooling | local seed/runner, isolated test runner, hosting-template preparation, secret scanner, preview aliases |
| Lint cleanup | theme context/hooks split and Root component extraction; generated output and the separate `.kilo` worktree excluded from lint |

## 5. Database collections and fields

- `products/{id}`: `schemaVersion`, `name`, `slug`, `sku`, `description`, `details`, `category`, `price`, optional `comparisonPrice`, `images`, cover `image`, `specifications`, `stock`, `lowStockThreshold`, `status`, `published`, `active`, `featured`, `version`, timestamps and `updatedBy`.
- `catalogueKeys/{key}`: server-only uniqueness claims for product/article slugs and product SKUs.
- `inventoryMovements/{id}`: product/order ID, type, quantity, previous/new quantities, reason, actor and timestamp; payment movements also identify sandbox/live. Request fingerprints make manual adjustment retries idempotent.
- `news/{id}`: existing collection extended with blog schema: title/slug, excerpt/summary/content, author/category/tags, media type/image/video URL/canonical embed URL, status/publication date, SEO fields, version and timestamps.
- `orders/{id}`: existing schema 2 retained; added `customerInfo.landmark`, `inventoryStatus`, cancellation fields and refund-review flag. `orderStatus: ready` added. Old persisted statuses map to the new display labels.
- `fulfilmentEvents`: server-only changes with order, actor, from/to, optional note and time. Existing private `paymentSessions`, `paymentReferences` and `transactions` retained.
- `settings/global.shippingFee`: still required; trusted server setting in KES. Missing delivery pricing fails closed. Local seed uses zero solely for testing.

## 6. Rules and indexes

Public product reads require `published == true`; article reads require `status == published`. Admins can read drafts. All product/blog/inventory/payment/order writes go through authenticated server routes. Stock and uniqueness records cannot be modified directly from a browser. Customers can read their own order history; admins can read all.

Storage accepts new JPEG/PNG/WebP/GIF images below 5 MB under `commerce/products` or `commerce/news`, from admins only. Replacement uses a new path; overwrite/delete are denied. Images are public media and download URLs are shareable; do not upload confidential material. The existence guard follows the [Firebase Storage rules reference](https://firebase.google.com/docs/reference/security/storage).

Implemented queries use single-field filters and local sorting; no composite indexes are required. `backend/firestore.indexes.json` records the empty composite-index set. These are launch-scope rules; the learning prototype is not represented as fully secured or completed.

## 7–8. Verification

| Check | Final result |
| --- | --- |
| `npm run test:commerce` | **34 passed; 0 failed; 0 skipped** (32.3 seconds of tests; emulator startup additional) |
| `npm run typecheck` | **Passed**, frontend and functions |
| `npm run lint` | **Passed**, 0 errors/warnings |
| `npm run build` | **Passed**; large-chunk advisory remains (see build log for final timing) |
| `node scripts/check-launch-secrets.cjs` | **Passed**, no matched credentials/test logins in publishable source/bundle |
| `git diff --check` | **Passed** after whitespace cleanup |
| Actual browser checks | **Passed**: admin login; draft product + real local image upload; preview/publication; stock in/out; article draft/preview/image upload/publication and public page; escaped HTML; product detail; customer sign-in/cart/quote for KES 12,000, Voi + landmark; unavailable local payments fail closed; customer and admin show the same order. Product, article and admin layouts fit 390px. |
| Real IntaSend sandbox/webhook | **Not run**, requires external staging/provider configuration |

Logs are in ignored `.local/commerce-launch-*.log`; the mobile admin screenshot is `.local/commerce-admin-mobile.png`. Browser testing found and fixed modal/dropdown layering and the local emulator warning intercepting clicks. An emulator startup interruption was resolved by restarting the local stack; its final Auth, Firestore, Storage, API and frontend services are running. Tests use separate ports/project; avoid competing emulator startups.

Added focused coverage for admin product access and validation, private catalogue visibility, unique SKU/slug and edit conflicts, nonnegative/idempotent stock adjustments/history, quantity restrictions, once-only settlement inventory, insufficient-stock review, cancellation/late payment, fulfilment history, private drafts/publication/archive, malicious video URLs, media uploads/overwrite prevention, HTML escaping, metadata and sitemap privacy. Existing pricing, ownership, role, payment-mismatch, replay and account tests were retained. One history assertion now includes the newly added payment-verification event.

## 9. Required environment variable names

Frontend web-app configuration (public Firebase identifiers):
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`; optional `VITE_FIREBASE_MEASUREMENT_ID`.

Frontend runtime/build: `VITE_COMMERCE_API_URL`, `VITE_SITE_URL`, `VITE_USE_FIREBASE_EMULATORS=false`, `VITE_INDEXABLE=false` for staging. Existing chatbot setting `VITE_CHAT_API_URL` remains optional.

Functions: `INTASEND_MODE=sandbox`, `INTASEND_PUBLIC_KEY`, `STOREFRONT_ORIGIN` (exact staging origin, no trailing slash), `SITE_INDEXABLE=false`.

Secret Manager only: `INTASEND_SECRET_KEY`, `INTASEND_WEBHOOK_CHALLENGE` (new random value at least 32 characters). Never prefix secrets with `VITE_` or put service-account credentials in the frontend.

## 10. Firebase staging preparation

1. Create/select a separate staging Firebase project, enable its required billing/services, register a web app, enable Email/Password authentication, create Firestore in locked mode and initialize Storage. Review any billing requirement in the Firebase console before activation.
2. Copy that web app's public configuration into an ignored local `.env.local` or hosting build environment. Set the staging origin/API URL above. Do not reuse the live project identifiers or the emulator test accounts.
3. Create a real staging test user through Authentication; set its `users/{uid}` document with trusted console/Admin SDK access. Assign `role: admin` only to reviewed administrators. Audit previously assigned admin roles before any eventual live migration.
4. Configure `settings/global.shippingFee` with the agreed test delivery charge. Create products through the admin dashboard or perform a separately reviewed migration of the old catalogue. Old static products/news are not automatically published to a real database.
5. Add the staging domain to authorized Authentication domains. Put non-secret function settings in ignored `backend/functions/.env.<STAGING_PROJECT_ID>` and set the two Secret Manager values using Firebase's prompts.
6. After approval, build frontend and functions, then deploy rules/indexes, Storage rules, functions and Firebase Hosting to the explicitly selected staging project. `npm run build` creates `backend/functions/storefront.html`, required for server metadata. Deploy frontend/functions together.
7. Keep indexing disabled in both frontend and function settings. Confirm product/article deep-link rewrites and `/sitemap.xml` reach `api`; a plain static host requires equivalent proxy rewrites and is not a full substitute.

## 11–12. IntaSend sandbox and webhook setup

1. Open the intended merchant account's sandbox/test environment and obtain a fresh sandbox public/secret pair. Supply the public key to the function environment and the secret through Secret Manager.
2. Configure payment collection notifications for pending/processing, complete and failed outcomes in the sandbox webhook dashboard.
3. Webhook URL: `https://us-central1-<STAGING_PROJECT_ID>.cloudfunctions.net/api/payments/intasend/webhook` (or the equivalent URL returned by the deployed function).
4. Configure the same new webhook challenge in the merchant dashboard and Secret Manager. Save the endpoint and verify delivery/retry status there.
5. Set frontend API base to `https://us-central1-<STAGING_PROJECT_ID>.cloudfunctions.net/api`. Hosted-checkout return URL is generated as `<STOREFRONT_ORIGIN>/profile?order=<id>`.
6. Verify the real account's checkout response (`id`, `signature`, approved HTTPS URL) and authoritative status response. The adapter uses checkout ID/signature to query status; compatibility still needs an actual sandbox response. Browser redirects/webhook claims alone never mark paid.
7. Run sandbox success, failure, interruption, repeated callback and delayed confirmation tests. Obtain consent before any mobile prompt that could debit a real phone. A small explicitly approved live transaction belongs to a later production acceptance step.

## 13. Secret rotation

Treat the old exposed IntaSend key as compromised. Revoke/rotate it in the merchant dashboard; generate new sandbox and later live credentials separately. Update Secret Manager, redeploy approved functions and confirm the old key is rejected. Remove obsolete secrets from hosting environment settings and old public bundles. Source removal does not invalidate keys or erase Git history. Any history rewrite must be agreed with repository collaborators; none was performed here.

## 14. Known limitations

- No temporary stock holds: simultaneous buyers can pay for the last units. The transaction prevents negative stock; the affected paid order stays visible with a stock-review block. Arrange replenishment and Allocate available stock, or reconcile a refund manually. Do not claim overselling has been eliminated.
- Cancelling a paid order does not automatically refund money or restore stock. Confirm refunds in IntaSend and record returned stock explicitly. Verified sales is gross collected value (including delivery), not net revenue after refunds/fees.
- Ambiguous provider checkout-creation timeouts remain held for operator review rather than automatically creating another charge. Retry of eligible unpaid orders resumes the stored checkout.
- The admin currently subscribes to full collections and filters locally. Pagination/aggregation will be needed as volumes grow.
- Builds still report a large JavaScript bundle warning. No unrelated package upgrades or broad optimization work was undertaken.
- Local emulator data is ephemeral. The local runner's test passwords remain in ignored `.local/test-accounts.json`; use `npm run dev:local` to recreate them.
- Previously uploaded public media is retained when replaced/archived; cleanup is deferred. Unpublishing removes article/product records from public access, not already shared image URLs.

## 15. Manual acceptance before launch

- Admin: create a draft product; upload/replace image; preview; publish; verify shop/detail; unpublish and archive; confirm private links cannot load.
- Inventory: stock in/out, damage/return/correction; verify notes, quantities and history; try invalid/negative/over-stock quantities and concurrent edits.
- Customer: sign in, cart, town + landmark, server quote, sandbox payment, return/profile. Confirm same order appears in admin. Test an interrupted payment, failure/retry and cancellation.
- Provider: verify amount/currency/reference matching and real webhook delivery; replay completion and confirm one stock movement; verify sandbox does not affect live sales or permit dispatch.
- Fulfilment: approved live verification is a later acceptance step; check processing → ready → dispatched → delivered and history. Review any stock exception before dispatch.
- Blog: image and YouTube/Vimeo posts, draft preview, publish/list/detail, unpublish/archive and direct-link privacy. Check mobile forms, images, browser title, canonical/social metadata and sitemap.

## 16–17. Suggested commit and safe review/push commands

Suggested commit: `feat: prepare commerce dashboard, inventory and blog for staging`

Run from the fork checkout. These commands are instructions only; no commit or push has been executed. Review current files in the editor; avoid printing the old raw secret-containing diff.

```powershell
Set-Location 'I:\Next-js-websites\TOP-HEIGHTS-ELECTRICIANS'
git branch --show-current
git remote get-url origin
# Expected: feat/commerce-launch and https://github.com/CreatorLarry/TOP-HEIGHTS-ELECTRICIANS.git
git status --short
git diff --stat
node scripts/check-launch-secrets.cjs
npm run test:commerce
npm run typecheck
npm run lint
npm run build
```

After your review/approval, stage the intended application files explicitly; keep `.local`, credentials, generated bundles and `.kilo` out of Git:

```powershell
git add -- .env.example .env.commerce.example .gitignore backend/firestore.rules backend/firestore.indexes.json backend/storage.rules backend/functions/.env.example backend/functions/package.json backend/functions/package-lock.json backend/functions/src backend/functions/scripts backend/functions/test backend/functions/lib/index.js firebase.json firebase.test.json index.html package.json src scripts tests docs vite.config.ts vite.preview.config.ts eslint.config.js
git diff --cached --stat
node scripts/check-launch-secrets.cjs
git commit -m "feat: prepare commerce dashboard, inventory and blog for staging"
git push --dry-run origin HEAD:refs/heads/feat/commerce-launch
# Only after approval:
git push -u origin HEAD:refs/heads/feat/commerce-launch
```

Pushing this feature branch does not merge it into `main`. Check the fork's hosting/CI branch settings before any push if it has automatic branch previews. Do not push `main` or use the original upstream URL.
