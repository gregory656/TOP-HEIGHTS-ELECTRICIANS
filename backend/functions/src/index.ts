import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

/**
 * POST /api/mpesa/stkpush
 * Body: { orderId: string, phone: string }
 *
 * NOTE:
 * - This is a skeleton endpoint.
 * - Wire it to your preferred provider (Daraja, IntaSend, etc).
 * - Always read order totals from Firestore (never trust client amount).
 */
app.post('/mpesa/stkpush', async (req, res) => {
  try {
    const { orderId, phone } = req.body as { orderId?: string; phone?: string };
    if (!orderId || !phone) {
      return res.status(400).json({ ok: false, message: 'orderId and phone are required' });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return res.status(404).json({ ok: false, message: 'Order not found' });
    }

    const order = orderSnap.data() as { totalAmount?: number; paymentStatus?: string; userId?: string };
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ ok: false, message: 'Order is not pending' });
    }

    // Mark as processing before initiating payment
    await orderRef.update({
      paymentStatus: 'processing',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // TODO: Call your payment provider here and return a reference (checkoutId/transactionId)
    // Example return shape:
    // return res.json({ ok: true, checkoutId: 'provider-checkout-id' });

    return res.json({
      ok: true,
      message: 'STK push initiation placeholder (implement provider call).',
      orderId,
      phone,
      amount: order.totalAmount ?? null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/**
 * POST /api/mpesa/callback
 * Provider webhook should call this endpoint (verify signature/provider origin!).
 *
 * NOTE: Skeleton only. Store raw callback in `transactions` and update the order.
 */
app.post('/mpesa/callback', async (req, res) => {
  try {
    const payload = req.body as Record<string, unknown>;
    const orderId = (payload.orderId as string) || (payload.api_ref as string) || '';

    // Always store raw payload for audit/debugging
    await db.collection('transactions').add({
      orderId: orderId || null,
      paymentMethod: 'mpesa',
      status: 'unknown',
      rawCallbackData: payload,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // TODO: Verify provider receipt + set paymentStatus/orderStatus accordingly.
    // await db.collection('orders').doc(orderId).update({ ... });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
});

/**
 * POST /api/paypal/create
 * Body: { orderId: string }
 *
 * Skeleton placeholder for PayPal order creation + redirect URL.
 */
app.post('/paypal/create', async (req, res) => {
  const { orderId } = req.body as { orderId?: string };
  if (!orderId) return res.status(400).json({ ok: false, message: 'orderId is required' });
  return res.json({
    ok: false,
    message: 'PayPal integration not implemented yet (skeleton endpoint).',
    orderId,
  });
});

/**
 * POST /api/card/intent
 * Body: { orderId: string }
 *
 * Skeleton placeholder for card payment intent/session creation (Stripe/IntaSend/etc).
 */
app.post('/card/intent', async (req, res) => {
  const { orderId } = req.body as { orderId?: string };
  if (!orderId) return res.status(400).json({ ok: false, message: 'orderId is required' });
  return res.json({
    ok: false,
    message: 'Card integration not implemented yet (skeleton endpoint).',
    orderId,
  });
});

export const api = onRequest({ cors: true }, app);

