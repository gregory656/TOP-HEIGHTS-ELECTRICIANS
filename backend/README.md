# TopHeights Backend (Firestore + Payments)

This folder contains **documentation and deployable Firebase config** for the TopHeights cart/order/payment flow.

## Firestore schema (source of truth)

- **Cart (per user)**: `users/{uid}/cart/{productId}`
- **Orders**: `orders/{orderId}`
- **Products**: `products/{productId}`
- **Transactions (audit)**: `transactions/{transactionId}`
- **Settings**: `settings/global`

See `backend/database-schema.js` for field-level reference.

## Firestore rules

Deploy rules from `backend/firestore.rules` (wired via `firebase.json`).

```bash
firebase deploy --only firestore:rules
```

## Cloud Functions API (payment skeleton)

This repo includes a starter Firebase Functions API under `backend/functions`:

- `GET /api/health`
- `POST /api/mpesa/stkpush`
- `POST /api/mpesa/callback` (webhook placeholder)
- `POST /api/paypal/create` (placeholder)
- `POST /api/card/intent` (placeholder)

Deploy:

```bash
cd backend/functions
npm install
npm run build
cd ../..
firebase deploy --only functions
```

## Important security intent

- Customers can read/write **only their own** cart.
- Customers can **create** orders, and can **read** their own orders.
- Only admin/backend should update `paymentStatus`, `orderStatus`, `totalAmount`, etc.

