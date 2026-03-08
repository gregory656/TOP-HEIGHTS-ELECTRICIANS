import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import type { Request, Response } from 'express';

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

const INTASEND_API_BASE = 'https://payment.intasend.com';
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY || '';
const INTASEND_MERCHANT_SHORTCODE = process.env.INTASEND_MERCHANT_SHORTCODE || '';

const formatKenyanPhone = (phone: string): string => {
  let formatted = String(phone || '').trim().replace(/\s+/g, '');
  if (formatted.startsWith('+')) formatted = formatted.slice(1);
  if (formatted.startsWith('0')) formatted = `254${formatted.slice(1)}`;
  if (!formatted.startsWith('254')) formatted = `254${formatted}`;
  return formatted;
};

const extractOrderId = (payload: Record<string, unknown>): string => {
  const candidates = [
    payload.api_ref,
    payload.orderId,
    (payload.invoice as { api_ref?: string } | undefined)?.api_ref,
    (payload.data as { api_ref?: string } | undefined)?.api_ref,
    (payload.invoice as { order_id?: string } | undefined)?.order_id,
    (payload.data as { order_id?: string } | undefined)?.order_id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
};

const extractCheckoutId = (payload: Record<string, unknown>): string | null => {
  const candidates = [
    payload.checkout_id,
    (payload.invoice as { checkout_id?: string } | undefined)?.checkout_id,
    (payload.data as { checkout_id?: string } | undefined)?.checkout_id,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
};

const extractInvoiceId = (payload: Record<string, unknown>): string | null => {
  const candidates = [
    payload.invoice_id,
    (payload.invoice as { invoice_id?: string; id?: string } | undefined)?.invoice_id,
    (payload.invoice as { invoice_id?: string; id?: string } | undefined)?.id,
    (payload.data as { invoice_id?: string; id?: string } | undefined)?.invoice_id,
    (payload.data as { invoice_id?: string; id?: string } | undefined)?.id,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
};

const extractReceiptNumber = (payload: Record<string, unknown>): string | null => {
  const candidates = [
    payload.mpesa_receipt_number,
    payload.mpesa_receipt,
    (payload.invoice as { mpesa_receipt_number?: string; mpesa_reference?: string } | undefined)?.mpesa_receipt_number,
    (payload.invoice as { mpesa_receipt_number?: string; mpesa_reference?: string } | undefined)?.mpesa_reference,
    (payload.data as { mpesa_receipt_number?: string; mpesa_reference?: string } | undefined)?.mpesa_receipt_number,
    (payload.data as { mpesa_receipt_number?: string; mpesa_reference?: string } | undefined)?.mpesa_reference,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
};

const normalizePaymentState = (payload: Record<string, unknown>): string => {
  const candidates = [
    payload.state,
    payload.status,
    (payload.invoice as { state?: string; status?: string } | undefined)?.state,
    (payload.invoice as { state?: string; status?: string } | undefined)?.status,
    (payload.data as { state?: string; status?: string } | undefined)?.state,
    (payload.data as { state?: string; status?: string } | undefined)?.status,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim().toLowerCase();
  }

  const reasonCandidates = [
    payload.message,
    payload.reason,
    payload.error,
    (payload.invoice as { message?: string; reason?: string; error?: string } | undefined)?.message,
    (payload.invoice as { message?: string; reason?: string; error?: string } | undefined)?.reason,
    (payload.data as { message?: string; reason?: string; error?: string } | undefined)?.message,
    (payload.data as { message?: string; reason?: string; error?: string } | undefined)?.reason,
  ];
  for (const reason of reasonCandidates) {
    if (typeof reason === 'string' && reason.toLowerCase().includes('insufficient')) {
      return 'insufficient_funds';
    }
  }

  return 'unknown';
};

const isPaidState = (state: string): boolean => {
  const s = state.toLowerCase();
  return s === 'complete' || s === 'completed' || s === 'paid' || s === 'settled' || s === 'success' || s === 'succeeded';
};

const isFailedState = (state: string): boolean => {
  const s = state.toLowerCase();
  return s === 'failed'
    || s === 'cancelled'
    || s === 'canceled'
    || s === 'declined'
    || s === 'error'
    || s === 'insufficient_funds'
    || s === 'insufficient_balance';
};

const applyOrderPaymentUpdate = async (orderId: string, payload: Record<string, unknown>) => {
  if (!orderId) return;

  const state = normalizePaymentState(payload);
  const checkoutId = extractCheckoutId(payload);
  const invoiceId = extractInvoiceId(payload);
  const mpesaReceiptNumber = extractReceiptNumber(payload);

  const update: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (checkoutId) update.checkoutId = checkoutId;
  if (invoiceId) update.invoiceId = invoiceId;
  if (mpesaReceiptNumber) update.mpesaReceiptNumber = mpesaReceiptNumber;

  if (isPaidState(state)) {
    update.paymentStatus = 'paid';
    update.orderStatus = 'processed';
  } else if (isFailedState(state)) {
    update.paymentStatus = 'failed';
  } else {
    update.paymentStatus = 'processing';
  }

  await db.collection('orders').doc(orderId).set(update, { merge: true });
};

/**
 * POST /api/mpesa/stkpush
 * Body: { orderId: string, phone: string }
 *
 * NOTE:
 * - This is a skeleton endpoint.
 * - Wire it to your preferred provider (Daraja, IntaSend, etc).
 * - Always read order totals from Firestore (never trust client amount).
 */
app.post('/mpesa/stkpush', async (req: Request, res: Response) => {
  try {
    if (!INTASEND_SECRET_KEY) {
      return res.status(500).json({ ok: false, message: 'INTASEND_SECRET_KEY is not configured in Cloud Functions' });
    }

    const { orderId, phone, email } = req.body as { orderId?: string; phone?: string; email?: string };
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

    const callbackBase = process.env.INTASEND_CALLBACK_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const callbackUrl = `${callbackBase}/mpesa/callback`;

    const requestBody: Record<string, unknown> = {
      method: 'MPESA',
      currency: 'KES',
      amount: Number(order.totalAmount || 0),
      phone_number: formatKenyanPhone(phone),
      email: email || '',
      api_ref: orderId,
      callback_url: callbackUrl,
    };

    if (INTASEND_MERCHANT_SHORTCODE) {
      requestBody.merchant_shortcode = INTASEND_MERCHANT_SHORTCODE;
    }

    const providerRes = await fetch(`${INTASEND_API_BASE}/api/v1/checkout/stk-push/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${INTASEND_SECRET_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const providerData = (await providerRes.json()) as Record<string, unknown>;
    if (!providerRes.ok) {
      await orderRef.set(
        {
          paymentStatus: 'failed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return res.status(400).json({
        ok: false,
        message: (providerData.message as string) || 'Failed to initiate STK push',
        provider: providerData,
      });
    }

    const checkoutId = extractCheckoutId(providerData);
    const invoiceId = extractInvoiceId(providerData);

    await orderRef.set(
      {
        paymentStatus: 'processing',
        checkoutId,
        invoiceId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await db.collection('transactions').add({
      orderId,
      paymentMethod: 'mpesa',
      status: 'processing',
      provider: 'intasend',
      checkoutId,
      invoiceId,
      phone: formatKenyanPhone(phone),
      amount: Number(order.totalAmount || 0),
      rawResponseData: providerData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ ok: true, orderId, checkoutId, invoiceId, status: 'processing' });
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
app.post('/mpesa/callback', async (req: Request, res: Response) => {
  try {
    const payload = req.body as Record<string, unknown>;
    const orderId = extractOrderId(payload);
    const status = normalizePaymentState(payload);

    // Always store raw payload for audit/debugging
    await db.collection('transactions').add({
      orderId: orderId || null,
      paymentMethod: 'mpesa',
      status,
      provider: 'intasend',
      checkoutId: extractCheckoutId(payload),
      invoiceId: extractInvoiceId(payload),
      mpesaReceiptNumber: extractReceiptNumber(payload),
      rawCallbackData: payload,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await applyOrderPaymentUpdate(orderId, payload);

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
});

/**
 * GET /api/mpesa/status/:checkoutId?orderId=<orderId>
 * Poll IntaSend for STK status and sync Firestore order.
 */
app.get('/mpesa/status/:checkoutId', async (req: Request, res: Response) => {
  try {
    if (!INTASEND_SECRET_KEY) {
      return res.status(500).json({ ok: false, message: 'INTASEND_SECRET_KEY is not configured in Cloud Functions' });
    }

    const checkoutId = req.params.checkoutId;
    const orderId = typeof req.query.orderId === 'string' ? req.query.orderId : '';
    if (!checkoutId) return res.status(400).json({ ok: false, message: 'checkoutId is required' });

    const providerRes = await fetch(`${INTASEND_API_BASE}/api/v1/checkout/${checkoutId}/status/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${INTASEND_SECRET_KEY}`,
      },
    });

    const providerData = (await providerRes.json()) as Record<string, unknown>;
    if (!providerRes.ok) {
      return res.status(400).json({
        ok: false,
        message: (providerData.message as string) || 'Failed to check payment status',
        provider: providerData,
      });
    }

    const resolvedOrderId = orderId || extractOrderId(providerData);
    await applyOrderPaymentUpdate(resolvedOrderId, providerData);

    return res.json({
      ok: true,
      orderId: resolvedOrderId || null,
      checkoutId,
      status: normalizePaymentState(providerData),
      provider: providerData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/**
 * POST /api/paypal/create
 * Body: { orderId: string }
 *
 * Skeleton placeholder for PayPal order creation + redirect URL.
 */
app.post('/paypal/create', async (req: Request, res: Response) => {
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
app.post('/card/intent', async (req: Request, res: Response) => {
  const { orderId } = req.body as { orderId?: string };
  if (!orderId) return res.status(400).json({ ok: false, message: 'orderId is required' });
  return res.json({
    ok: false,
    message: 'Card integration not implemented yet (skeleton endpoint).',
    orderId,
  });
});

export const api = onRequest({ cors: true }, app);
