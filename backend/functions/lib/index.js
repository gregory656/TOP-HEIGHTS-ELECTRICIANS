"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
admin.initializeApp();
const db = admin.firestore();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
const INTASEND_API_BASE = 'https://payment.intasend.com';
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY || '';
const INTASEND_MERCHANT_SHORTCODE = process.env.INTASEND_MERCHANT_SHORTCODE || '';
const formatKenyanPhone = (phone) => {
    let formatted = String(phone || '').trim().replace(/\s+/g, '');
    if (formatted.startsWith('+'))
        formatted = formatted.slice(1);
    if (formatted.startsWith('0'))
        formatted = `254${formatted.slice(1)}`;
    if (!formatted.startsWith('254'))
        formatted = `254${formatted}`;
    return formatted;
};
const extractOrderId = (payload) => {
    const candidates = [
        payload.api_ref,
        payload.orderId,
        payload.invoice?.api_ref,
        payload.data?.api_ref,
        payload.invoice?.order_id,
        payload.data?.order_id,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim())
            return candidate.trim();
    }
    return '';
};
const extractCheckoutId = (payload) => {
    const candidates = [
        payload.checkout_id,
        payload.invoice?.checkout_id,
        payload.data?.checkout_id,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim())
            return candidate.trim();
    }
    return null;
};
const extractInvoiceId = (payload) => {
    const candidates = [
        payload.invoice_id,
        payload.invoice?.invoice_id,
        payload.invoice?.id,
        payload.data?.invoice_id,
        payload.data?.id,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim())
            return candidate.trim();
    }
    return null;
};
const extractReceiptNumber = (payload) => {
    const candidates = [
        payload.mpesa_receipt_number,
        payload.mpesa_receipt,
        payload.invoice?.mpesa_receipt_number,
        payload.invoice?.mpesa_reference,
        payload.data?.mpesa_receipt_number,
        payload.data?.mpesa_reference,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim())
            return candidate.trim();
    }
    return null;
};
const normalizePaymentState = (payload) => {
    const candidates = [
        payload.state,
        payload.status,
        payload.invoice?.state,
        payload.invoice?.status,
        payload.data?.state,
        payload.data?.status,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim())
            return candidate.trim().toLowerCase();
    }
    const reasonCandidates = [
        payload.message,
        payload.reason,
        payload.error,
        payload.invoice?.message,
        payload.invoice?.reason,
        payload.data?.message,
        payload.data?.reason,
    ];
    for (const reason of reasonCandidates) {
        if (typeof reason === 'string' && reason.toLowerCase().includes('insufficient')) {
            return 'insufficient_funds';
        }
    }
    return 'unknown';
};
const isPaidState = (state) => {
    const s = state.toLowerCase();
    return s === 'complete' || s === 'completed' || s === 'paid' || s === 'settled' || s === 'success' || s === 'succeeded';
};
const isFailedState = (state) => {
    const s = state.toLowerCase();
    return s === 'failed'
        || s === 'cancelled'
        || s === 'canceled'
        || s === 'declined'
        || s === 'error'
        || s === 'insufficient_funds'
        || s === 'insufficient_balance';
};
const applyOrderPaymentUpdate = async (orderId, payload) => {
    if (!orderId)
        return;
    const state = normalizePaymentState(payload);
    const checkoutId = extractCheckoutId(payload);
    const invoiceId = extractInvoiceId(payload);
    const mpesaReceiptNumber = extractReceiptNumber(payload);
    const update = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (checkoutId)
        update.checkoutId = checkoutId;
    if (invoiceId)
        update.invoiceId = invoiceId;
    if (mpesaReceiptNumber)
        update.mpesaReceiptNumber = mpesaReceiptNumber;
    if (isPaidState(state)) {
        update.paymentStatus = 'paid';
        update.orderStatus = 'processed';
    }
    else if (isFailedState(state)) {
        update.paymentStatus = 'failed';
    }
    else {
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
app.post('/mpesa/stkpush', async (req, res) => {
    try {
        if (!INTASEND_SECRET_KEY) {
            return res.status(500).json({ ok: false, message: 'INTASEND_SECRET_KEY is not configured in Cloud Functions' });
        }
        const { orderId, phone, email } = req.body;
        if (!orderId || !phone) {
            return res.status(400).json({ ok: false, message: 'orderId and phone are required' });
        }
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            return res.status(404).json({ ok: false, message: 'Order not found' });
        }
        const order = orderSnap.data();
        if (order.paymentStatus !== 'pending') {
            return res.status(400).json({ ok: false, message: 'Order is not pending' });
        }
        const callbackBase = process.env.INTASEND_CALLBACK_BASE_URL || `${req.protocol}://${req.get('host')}`;
        const callbackUrl = `${callbackBase}/mpesa/callback`;
        const requestBody = {
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
        const providerData = (await providerRes.json());
        if (!providerRes.ok) {
            await orderRef.set({
                paymentStatus: 'failed',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            return res.status(400).json({
                ok: false,
                message: providerData.message || 'Failed to initiate STK push',
                provider: providerData,
            });
        }
        const checkoutId = extractCheckoutId(providerData);
        const invoiceId = extractInvoiceId(providerData);
        await orderRef.set({
            paymentStatus: 'processing',
            checkoutId,
            invoiceId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
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
    }
    catch (e) {
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
        const payload = req.body;
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
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ ok: false });
    }
});
/**
 * GET /api/mpesa/status/:checkoutId?orderId=<orderId>
 * Poll IntaSend for STK status and sync Firestore order.
 */
app.get('/mpesa/status/:checkoutId', async (req, res) => {
    try {
        if (!INTASEND_SECRET_KEY) {
            return res.status(500).json({ ok: false, message: 'INTASEND_SECRET_KEY is not configured in Cloud Functions' });
        }
        const checkoutId = req.params.checkoutId;
        const orderId = typeof req.query.orderId === 'string' ? req.query.orderId : '';
        if (!checkoutId)
            return res.status(400).json({ ok: false, message: 'checkoutId is required' });
        const providerRes = await fetch(`${INTASEND_API_BASE}/api/v1/checkout/${checkoutId}/status/`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${INTASEND_SECRET_KEY}`,
            },
        });
        const providerData = (await providerRes.json());
        if (!providerRes.ok) {
            return res.status(400).json({
                ok: false,
                message: providerData.message || 'Failed to check payment status',
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
    }
    catch (e) {
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
app.post('/paypal/create', async (req, res) => {
    const { orderId } = req.body;
    if (!orderId)
        return res.status(400).json({ ok: false, message: 'orderId is required' });
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
    const { orderId } = req.body;
    if (!orderId)
        return res.status(400).json({ ok: false, message: 'orderId is required' });
    return res.json({
        ok: false,
        message: 'Card integration not implemented yet (skeleton endpoint).',
        orderId,
    });
});
exports.api = (0, https_1.onRequest)({ cors: true }, app);
