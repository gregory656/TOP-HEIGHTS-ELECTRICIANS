# Commerce connection and launch checklist

The shop checkout, My Orders (`/profile`) and Business admin (`/admin`) now use the same `orders` documents. Prices and delivery fees are calculated by Firebase Functions; IntaSend hosts payment entry. Town names such as Voi, Embu and Thika are accepted. A landmark is optional.

This is a local implementation, not a completed live payment rollout. No production data, roles, payment settings, GitHub branches or deployments were changed. The isolated client-preview ZIP is still a visual preview with payments disabled.

## Before accepting real money

1. Rotate the IntaSend secret previously embedded in the browser configuration. Removing it from source does not revoke the old key or remove it from Git history/old deployed bundles. Never put a secret in a `VITE_` variable.
2. Use a separate Firebase staging project and IntaSend sandbox account. Configure backend `INTASEND_MODE=sandbox`, `INTASEND_PUBLIC_KEY`, and `STOREFRONT_ORIGIN` (exact frontend origin, no trailing path). Configure `INTASEND_SECRET_KEY` and a random `INTASEND_WEBHOOK_CHALLENGE` of at least 32 characters through Firebase Secret Manager. Configure the matching challenge for IntaSend payment-collection webhooks at `https://<functions-api>/payments/intasend/webhook`.
3. Populate server-owned `products/{id}` documents for each storefront product with `name`, numeric `price`, and `active: true`. IDs must match `src/data/products.ts` (currently 1–8). Missing/inactive products fail checkout. Set `settings/global.shippingFee` explicitly. The review step displays authoritative prices and the delivery fee before payment. Catalogue editing, delivery-zone rates and stock reservations remain separate work; any optional stock value is only an availability check, not a reservation.
4. Review existing administrator roles in `users/{uid}` using trusted Firebase Admin tooling. New accounts always start as customers. Previously assigned legitimate admin profiles remain usable; sign-in no longer grants admin by an email address. Deploy the updated Firestore rules with the API before enabling checkout. The rules deny all direct order writes, including from admins; admin delivery actions go through the API.
5. Set frontend `VITE_COMMERCE_API_URL` to the staging API base (including `/api` for Firebase Functions), then build. Node 22 is configured for Functions. The Firebase predeploy hook rebuilds TypeScript.
6. Complete a provider sandbox acceptance test: M-Pesa and card checkout, return to My Orders, delayed/duplicate webhooks, cancelled/failed payment and retry through the same hosted checkout. Confirm exact KES amount/currency, one verified transaction and the same status in both dashboards. Do not treat the browser redirect as proof of payment. Provider network/account testing has not been performed by this local work.
7. After staging acceptance and client approval, configure separate live keys and webhook, set mode to `live`, deploy deliberately, and perform an explicitly authorised small live transaction. Sandbox payments are labelled and excluded from verified sales/fulfilment.

## Local verification

`npm run test:commerce` builds Functions, launches Firestore emulator against `demo-topheights-commerce`, and runs API, rules, order-model and auth tests. It requires Java on PATH. On this machine Java is available under `C:\Program Files\JetBrains\WebStorm 2025.3.4\jbr\bin`; add it to PATH for that shell only if needed. Tests never use live Firebase or IntaSend. Install backend tools with `npm ci --prefix backend/functions` first.

For manual emulator work, use `.env.commerce.example` for the frontend and `backend/functions/.env.example` plus an untracked `.secret.local` for backend sandbox credentials. Start Firebase emulators for project `demo-topheights-commerce`, then Vite. The seed helper is deliberately emulator-only:

```powershell
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8085'
$env:SHIPPING_FEE_KES = '0' # Local test value only; confirm real delivery pricing separately.
node backend/functions/scripts/seed-local.cjs
```

## Records and recovery

- Order creation is idempotent for the same signed-in customer's checkout reference. Browser prices are ignored; quantities and catalogue availability are validated.
- Provider signatures and references are private server-only documents. Webhooks require the configured challenge and trigger an independent status lookup using the server-created checkout ID/signature. The server compares reference, currency and exact amount before recording payment.
- Transactions are keyed by provider invoice; duplicate events cannot count a sale twice. Paid orders cannot regress to failed or pending, and payment events cannot undo shipped/completed status. Only verified live orders can progress from processed to shipped to completed. Fulfilment events record the acting admin.
- A customer can resume the saved checkout or check payment from My Orders. An ambiguous checkout-creation timeout remains pending review, preventing an automatic duplicate provider request. An authorised operator must reconcile it in IntaSend using the private `apiRef`; recover the exact checkout ID/signature/URL only from trusted provider records, verify amount/currency/reference, then refresh. Never delete a session or mark an order paid merely to enable a retry.
- Older records without server verification are labelled unverified and excluded from sales. They require reconciliation before migration; no bulk migration was run.
- Refunds, cancellations after payment, stock reservation, accounting for provider fees/net settlement and automated recovery of unknown checkout-creation outcomes are not implemented. Verified sales currently show gross order totals, including delivery, before refunds/fees.
- Paid course enrolment is explicitly unavailable until its separate learning/payment entitlement flow is connected. No browser payment event grants paid course access. Existing free-course behaviour remains unchanged.

Provider contracts checked: [Create checkout](https://developers.intasend.com/reference/api_v1_checkout_create), [Check status](https://developers.intasend.com/reference/api_v1_payment_status_create), [Collection events](https://developers.intasend.com/docs/payment-collection-events), and the [official Node collection client](https://github.com/IntaSend/intasend-node/blob/master/src/collection.js). The provider sandbox test is needed to verify the account's current response shapes and checkout/status behaviour.

## Ready-to-use local dashboard accounts

Run `npm run dev:local` from the repository. It starts isolated Firebase Auth/Firestore emulators, seeds local catalogue/account records, and opens the frontend at `http://127.0.0.1:5174`. The order API runs on port 5002. Passwords are generated once and saved in the ignored `.local/test-accounts.json`; do not use these accounts on the live site. Stop the terminal with Ctrl+C. Emulator records are temporary; accounts and catalogue are reseeded on the next start.

- `admin@topheights.test`: business admin `/admin` and learning admin `/admin-dashboard`.
- `customer@topheights.test`: customer orders `/profile` and shop checkout.
- `student@topheights.test`: student interface `/student-dashboard`.

This mode supports login, creating pending orders with town-based delivery locations, and seeing those same records as customer/admin. Payment collection is disabled, and no order is labelled paid without a provider confirmation. Learning progress still uses the earlier local prototype; this is not a finished student/teacher synchronisation feature.
