# Ecommerce verification — 24 September 2026

**Outcome: local fixes verified; live-payment verification is blocked pending Firebase staging and IntaSend sandbox configuration.** No production writes, payments, deployment or GitHub push were performed.

The original path trusted browser prices/payment-completion callbacks and allowed user role escalation. The shared boundary is now the authenticated order API plus Firestore rules: prices come from the server catalogue, invoices are checked against the server-created checkout/reference/amount/currency, and only server verification marks a payment paid. Business admin and customer history read the same normalized orders. Town names including Voi, Embu and Thika are valid delivery locations.

## Evidence

- `npm run test:commerce`: **21 passed, 0 failed, 0 skipped**, using the Firestore emulator and a mocked payment provider. Covers unauthenticated/cross-user requests, forged callbacks, changed amounts/currencies/references, concurrent checkout, replay/late events, fulfilment permissions, sandbox isolation, user-role rules and direct order-write denial. Legitimate price quoting, verified settlement and delivery progression pass through the same API boundary.
- Reviewer findings addressed and tested: a later identical purchase receives a fresh order after webhook settlement; missing provider configuration can be corrected without permanently blocking the existing order.
- Browser checks on the actual UI components with isolated fixtures passed for town inputs, confirmed totals/delivery fee, keeping the cart on provider failure, never showing pending payment as successful, admin customer details/date rendering, fulfilment controls and mobile containment.
- Frontend TypeScript and preview build completed. The existing production output was checked for missing entry assets and embedded IntaSend secrets. A mobile drawer stacking issue found during visual review was corrected.
- Local test-account tooling is restricted to loopback Firebase emulators and the `demo-topheights-commerce` project. These accounts do not exist on the live website.

## Principal files

Backend: `backend/functions/src/{app,commerce,intasend,index}.ts`, `backend/firestore.rules`, Functions dependencies and `firebase.json`.

Frontend: `src/services/{orderService,orderModel,userProfile,firebase}.ts`, `src/context/AuthContext.tsx`, `src/components/{CheckoutSidebar,OrderActions}.tsx`, `src/pages/{AdminPanel,Profile}.tsx`, and the paid-course caller. Browser payment keys/SDK paths were removed; preview aliases remain isolated.

Regression coverage: `backend/functions/test/commerce.test.cjs`, `tests/orderCheckout.test.cjs`, `tests/orderModel.test.cjs`, `tests/userProfile.test.cjs`.

## Limits and next action

Provider response compatibility, actual M-Pesa/card completion, webhook delivery and settlement require a configured sandbox and explicit provider testing. Rotate the previously exposed provider secret before any rollout. Existing admin roles and historical payments need review before migration. Inventory reservation, refunds, delivery-zone pricing and the student/teacher progress platform remain separate work. See [setup and local accounts](ecommerce-setup.md).

Local launch smoke check passed: all three seeded accounts authenticate, a Voi order uses the catalogue price, customer and admin read the same record, another account is denied, and local payment initiation returns 503 without contacting a provider. Targeted ESLint check passed.
Browser login was also verified against the running local site: the seeded admin signed in through the normal form and saw the same customer order in Business admin.
