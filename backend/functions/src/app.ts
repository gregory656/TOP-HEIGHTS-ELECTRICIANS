import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { checkoutUrl, CommerceError, digest, fulfilmentChange, parseOrder, priceOrder, record, reject, validChallenge, verifyInvoice } from './commerce';
import type { PaymentProvider } from './intasend';
import { managementRoutes } from './management';
import { renderPage } from './seo';
import publicPages from './publicPages.json';
import { mediaRoutes, type ImageUploader } from './media';

export interface CommerceDependencies {
  db: Firestore;
  verifyToken(token: string): Promise<{ uid: string }>;
  provider: PaymentProvider;
  mode: 'sandbox' | 'live';
  storefront: string;
  webhookChallenge: string;
  htmlTemplate?: string;
  indexable?: boolean;
  imageUploader?: ImageUploader;
}

export function createCommerceApp(deps: CommerceDependencies) {
  const { db, provider, mode, storefront, webhookChallenge } = deps;
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: storefront, methods: ['GET', 'POST', 'PATCH'], allowedHeaders: ['Authorization', 'Content-Type'] }));
  app.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  const route = (fn: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => { void fn(req, res).catch(next); };
  const stamp = () => FieldValue.serverTimestamp();
  const id = (value: unknown) => {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) return reject('Invalid order reference.');
    return value;
  };
  async function identity(req: Request) {
    const bearer = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
    if (!bearer) return reject('Please sign in to continue.', 401);
    try { return (await deps.verifyToken(bearer)).uid; } catch { return reject('Your session has expired. Please sign in again.', 401); }
  }
  async function requireAdmin(uid: string) {
    if ((await db.doc(`users/${uid}`).get()).data()?.role !== 'admin') reject('Administrator access required.', 403);
  }
  async function ownedOrder(req: Request, adminAllowed = false) {
    const uid = await identity(req);
    const orderId = id(req.params.orderId);
    const reference = db.doc(`orders/${orderId}`);
    const order = (await reference.get()).data();
    if (!order) return reject('Order not found.', 404);
    if (order.userId !== uid) {
      if (!adminAllowed) reject('Order not found.', 404);
      await requireAdmin(uid);
    }
    if (order.schemaVersion !== 2) reject('This older order needs the shop to verify its payment manually.', 409);
    if (order.paymentEnvironment !== mode) reject('This order belongs to a different payment environment.', 409);
    return { uid, orderId, reference, order };
  }

  // Both webhook notifications and authenticated refreshes use this settlement boundary.
  async function reconcile(orderId: string, webhookInvoiceId?: string) {
    const orderRef = db.doc(`orders/${orderId}`);
    const sessionRef = db.doc(`paymentSessions/${orderId}`);
    const [orderSnap, sessionSnap] = await Promise.all([orderRef.get(), sessionRef.get()]);
    const order = orderSnap.data();
    const session = sessionSnap.data();
    if (!order || order.schemaVersion !== 2 || order.paymentEnvironment !== mode) reject('Order cannot be verified.', 409);
    if (!session?.checkoutId || !session.signature) return { paymentStatus: order!.paymentStatus, paymentVerified: order!.paymentVerified === true };
    const lookup = webhookInvoiceId ? { ...session, invoiceId: webhookInvoiceId } : session;
    const invoice = verifyInvoice(await provider.status(lookup), session, order!);
    if (webhookInvoiceId && invoice.invoiceId !== webhookInvoiceId) reject('Payment provider returned another invoice.', 409);
    if (order!.paymentVerified && order!.invoiceId !== invoice.invoiceId) reject('Another invoice was returned for a paid order. Contact the shop for reconciliation.', 409);
    const auditRef = db.doc(`transactions/${digest(`${mode}:${invoice.invoiceId}`)}`);
    return db.runTransaction(async tx => {
      const [freshSnap, auditSnap, freshSession] = await Promise.all([tx.get(orderRef), tx.get(auditRef), tx.get(sessionRef)]);
      const fresh = freshSnap.data()!;
      if (fresh.paymentVerified && fresh.invoiceId !== invoice.invoiceId) reject('Invoice changed on a verified order.', 409);
      if (fresh.paymentStatus === 'refunded') return { paymentStatus: 'refunded', paymentVerified: fresh.paymentVerified === true };
      if (freshSession.data()?.checkoutId !== session.checkoutId || fresh.totalMinor !== order!.totalMinor) reject('Order changed during verification.', 409);
      if (auditSnap.exists && auditSnap.data()?.orderId !== orderId) reject('Invoice is already assigned to another order.', 409);
      const paid = fresh.paymentVerified === true && fresh.paymentStatus === 'paid';
      const status = paid || invoice.state === 'COMPLETE' ? 'paid' : invoice.state === 'FAILED' ? 'failed' : 'processing';
      // Read all inventory before any transaction writes. A replay cannot deduct again.
      const settling = !paid && invoice.state === 'COMPLETE';
      const items: { productId: string; quantity: number }[] = fresh.items;
      const products = settling ? await Promise.all(items.map(item => tx.get(db.doc(`products/${item.productId}`)))) : [];
      const canDeduct = settling && fresh.orderStatus !== 'cancelled' && products.every((p, i) => p.exists && Number.isInteger(p.data()?.stock) && p.data()!.stock >= items[i].quantity);
      if (!paid) tx.set(sessionRef, { invoiceId: invoice.invoiceId }, { merge: true });
      tx.set(auditRef, { orderId, invoiceId: invoice.invoiceId, currency: 'KES', amount: fresh.totalAmount,
        paymentEnvironment: mode, state: auditSnap.data()?.state === 'COMPLETE' ? 'COMPLETE' : invoice.state, updatedAt: stamp() }, { merge: true });
      const update: Record<string, unknown> = { paymentStatus: status, updatedAt: stamp() };
      if (!paid) update.invoiceId = invoice.invoiceId;
      if (settling) {
        Object.assign(update, { paymentVerified: true, paidAt: stamp(), orderStatus: fresh.orderStatus === 'cancelled' ? 'cancelled' : 'processed',
          inventoryStatus: canDeduct ? 'deducted' : 'review', refundReviewRequired: fresh.orderStatus === 'cancelled' });
        if (canDeduct) products.forEach((product, i) => {
          const previous = product.data()!.stock, quantity = items[i].quantity;
          tx.update(product.ref, { stock: previous - quantity, version: Number(product.data()?.version || 0) + 1, updatedAt: stamp() });
          tx.create(db.doc(`inventoryMovements/sale-${orderId}-${items[i].productId}`), { productId: items[i].productId, orderId,
            type: 'sale', quantity, previousQuantity: previous, newQuantity: previous - quantity,
            actor: 'payment-verification', paymentEnvironment: mode, note: 'Provider-verified payment', createdAt: stamp() });
        });
        tx.create(db.collection('fulfilmentEvents').doc(), { orderId, actor: 'payment-verification', from: fresh.orderStatus,
          to: update.orderStatus, note: canDeduct ? 'Payment verified; stock deducted' : 'Payment verified; stock requires manual review', createdAt: stamp() });
      }
      tx.update(orderRef, update);
      return { paymentStatus: status, paymentVerified: paid || invoice.state === 'COMPLETE' };
    });
  }

  mediaRoutes(app, async req => { const uid = await identity(req); await requireAdmin(uid); return uid; }, deps.imageUploader);
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => { res.json({ ok: true, payments: mode }); });
  for (const [path, collection, kind] of [['shop', 'products', 'product'], ['blog', 'news', 'article']] as const) {
    app.get(`/${path}/:slug`, route(async (req, res) => {
      const slug = id(req.params.slug);
      const matches = await db.collection(collection).where('slug', '==', slug).limit(1).get();
      let entry: Record<string, unknown> | undefined = matches.docs[0]?.data();
      if (!entry && kind === 'product') entry = (await db.doc(`products/${slug}`).get()).data();
      if (!entry || (kind === 'product' ? entry.published !== true : entry.status !== 'published')) {
        res.status(404).set('X-Robots-Tag', 'noindex').type('html').send('<!doctype html><title>Not found</title><h1>This page is unavailable</h1><a href="/">Back to Top Heights Electricals</a>'); return;
      }
      if (!deps.htmlTemplate || !storefront) reject('Storefront template is not ready. Build the frontend before deployment.', 503);
      res.type('html').send(renderPage(deps.htmlTemplate!, { ...entry, slug: entry.slug || slug }, kind, storefront, deps.indexable === true));
    }));
  }
  managementRoutes(app, db, async req => { const uid = await identity(req); await requireAdmin(uid); return uid; });
  app.get('/sitemap.xml', route(async (_req, res) => {
    if (!storefront.startsWith('https://')) reject('Public site origin is not configured.', 503);
    const [products, posts] = await Promise.all([db.collection('products').where('published', '==', true).get(), db.collection('news').where('status', '==', 'published').get()]);
    const paths = [...publicPages.map(page => page.path), ...products.docs.map(p => `/shop/${encodeURIComponent(p.data().slug || p.id)}`), ...posts.docs.filter(p => typeof p.data().slug === 'string' && p.data().slug.length > 0).map(p => `/blog/${encodeURIComponent(p.data().slug)}`)];
    const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(path => `<url><loc>${escape(storefront + path)}</loc></url>`).join('')}</urlset>`);
  }));
  app.post('/orders', route(async (req, res) => {
    const uid = await identity(req);
    const request = parseOrder(req.body);
    const orderId = digest(`${uid}:${request.idempotencyKey}`).slice(0, 40);
    const fingerprint = digest(JSON.stringify(request));
    const ref = db.doc(`orders/${orderId}`);
    const order = await db.runTransaction(async tx => {
      const existing = await tx.get(ref);
      if (existing.exists) {
        if (existing.data()?.requestFingerprint !== fingerprint) reject('Checkout details changed. Start a new order.', 409);
        return existing.data()!;
      }
      const [settings, ...catalogue] = await Promise.all([
        tx.get(db.doc('settings/global')), ...request.items.map(item => tx.get(db.doc(`products/${item.productId}`))),
      ]);
      const shipping = settings.data()?.shippingFee;
      if (shipping === undefined) reject('Delivery pricing is not configured yet. Please contact the shop.', 503);
      const quote = priceOrder(request, catalogue.map(p => p.data()!), shipping);
      const data = { schemaVersion: 2, userId: uid, orderId, requestFingerprint: fingerprint,
        customerInfo: request.customerInfo, paymentMethod: request.paymentMethod, ...quote,
        paymentStatus: 'pending', paymentVerified: false, paymentEnvironment: mode, orderStatus: 'pending', inventoryStatus: 'not_deducted', createdAt: stamp(), updatedAt: stamp() };
      tx.create(ref, data);
      return data;
    });
    res.json({ orderId, items: order.items, subtotal: order.subtotal, shippingFee: order.shippingFee,
      totalAmount: order.totalAmount, paymentEnvironment: order.paymentEnvironment, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus });
  }));

  app.post('/orders/:orderId/payment', route(async (req, res) => {
    const { orderId, reference, order } = await ownedOrder(req);
    if (order.orderStatus === 'cancelled') reject('This order is cancelled. Start a new checkout.', 409);
    if (order.paymentVerified === true) { res.json({ paymentStatus: 'paid' }); return; }
    if (order.paymentMethod !== 'MPESA') reject('This payment option is paused. Start a new order using M-Pesa.', 409);
    if (webhookChallenge.length < 32 || !storefront) reject('Payments are not configured yet. Please contact the shop.', 503);
    provider.assertReady();
    let origin: URL;
    try { origin = new URL(storefront); } catch { return reject('The shop payment return address is not configured.', 503); }
    if (origin.origin !== storefront || (origin.protocol !== 'https:' && !(mode === 'sandbox' && origin.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(origin.hostname)))) reject('The shop payment return address is not configured.', 503);
    const sessionRef = db.doc(`paymentSessions/${orderId}`);
    const claim = await db.runTransaction(async tx => {
      const [sessionSnap, freshOrder] = await Promise.all([tx.get(sessionRef), tx.get(reference)]);
      if (freshOrder.data()?.orderStatus === 'cancelled') reject('This order is cancelled.', 409);
      if (freshOrder.data()?.paymentVerified === true) return { paid: true };
      const stock = await Promise.all((order.items as { productId: string; quantity: number }[]).map(item => tx.get(db.doc(`products/${item.productId}`))));
      if (stock.some((product, index) => product.data()?.active !== true || product.data()?.published !== true || product.data()?.status !== 'active' || !Number.isInteger(product.data()?.stock) || product.data()!.stock < order.items[index].quantity)) reject('A product is no longer available in that quantity. Update your cart before paying.', 409);
      if (sessionSnap.exists) return { session: sessionSnap.data()! };
      // Do not automatically repeat a provider creation after an ambiguous network timeout.
      const apiRef = randomUUID();
      tx.create(sessionRef, { apiRef, state: 'creating', createdAt: stamp() });
      tx.create(db.doc(`paymentReferences/${apiRef}`), { orderId });
      tx.update(reference, { paymentStatus: 'processing', updatedAt: stamp() });
      return { apiRef };
    });
    if ('paid' in claim) { res.json({ paymentStatus: 'paid' }); return; }
    if ('session' in claim) {
      if (!claim.session?.url) reject('Checkout is still being confirmed. Check this order again shortly; contact the shop if it remains pending.', 409);
      res.json({ url: checkoutUrl(claim.session!.url, mode), paymentStatus: order.paymentStatus }); return;
    }
    try {
      const response = await provider.create({
        amount: Number(order.totalAmount).toFixed(2), currency: 'KES', api_ref: claim.apiRef,
        email: order.customerInfo.email, phone_number: order.customerInfo.phone,
        host: storefront, redirect_url: `${storefront}/profile?order=${orderId}`,
        ...(order.paymentMethod === 'MPESA' ? { method: 'M-PESA' } : {}),
        mobile_tarrif: 'BUSINESS-PAYS', card_tarrif: 'BUSINESS-PAYS',
      });
      const url = checkoutUrl(response.url, mode);
      if (typeof response.id !== 'string' || typeof response.signature !== 'string' || !response.id || !response.signature) reject('Payment provider returned an incomplete checkout.', 502);
      await sessionRef.update({ checkoutId: response.id, signature: response.signature, url, state: 'ready', updatedAt: stamp() });
      res.json({ url, paymentStatus: 'processing' });
    } catch (error) {
      await sessionRef.update({ state: 'review', updatedAt: stamp() });
      throw error;
    }
  }));
  app.post('/orders/:orderId/status', route(async (req, res) => {
    const { orderId } = await ownedOrder(req, true);
    res.json(await reconcile(orderId));
  }));
  app.post('/payments/intasend/webhook', route(async (req, res) => {
    if (!validChallenge(record(req.body).challenge, webhookChallenge)) reject('Invalid webhook.', 401);
    const apiRef = record(req.body).api_ref;
    if (typeof apiRef !== 'string' || !/^[a-f0-9-]{36}$/.test(apiRef)) reject('Invalid payment reference.');
    const orderId = (await db.doc(`paymentReferences/${apiRef}`).get()).data()?.orderId;
    if (!orderId) reject('Unknown payment reference.', 404);
    const session = (await db.doc(`paymentSessions/${orderId}`).get()).data();
    if (!session?.checkoutId) reject('Checkout is not ready. Retry this event.', 503);
    // Webhook payload state/amount/invoice are never used as proof of payment.
    const candidate = record(req.body).invoice_id;
    if (candidate !== undefined && (typeof candidate !== 'string' || !/^[a-zA-Z0-9_-]{1,150}$/.test(candidate))) reject('Invalid invoice reference.');
    // The ID is only a lookup hint. The provider response must still match the
    // stored reference, exact amount and currency before any paid/stock write.
    await reconcile(orderId, candidate as string | undefined);
    res.json({ received: true });
  }));
  app.patch('/orders/:orderId/fulfilment', route(async (req, res) => {
    const uid = await identity(req);
    await requireAdmin(uid);
    const orderId = id(req.params.orderId);
    const ref = db.doc(`orders/${orderId}`);
    const next = record(req.body).orderStatus;
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) reject('Order not found.', 404);
      const order = snap.data()!;
      if (order.paymentEnvironment !== mode) reject('This order belongs to a different payment environment.', 409);
      fulfilmentChange(order, next);
      if (order.orderStatus === next) return;
      tx.update(ref, { orderStatus: next, updatedAt: stamp(), ...(next === 'cancelled' ? { cancelledAt: stamp(), cancellationNote: typeof req.body.note === 'string' ? req.body.note.slice(0, 1000) : '', refundReviewRequired: order.paymentVerified === true } : {}) });
      tx.create(db.collection('fulfilmentEvents').doc(), { orderId, actor: uid, from: order.orderStatus, to: next, createdAt: stamp() });
    });
    res.json({ orderStatus: next });
  }));
  app.post('/orders/:orderId/cancel', route(async (req, res) => {
    const { uid, orderId, reference } = await ownedOrder(req);
    await db.runTransaction(async tx => {
      const order = (await tx.get(reference)).data()!;
      if (order.orderStatus === 'cancelled') return;
      if (order.paymentVerified === true || order.orderStatus !== 'pending') reject('Contact the shop to cancel a paid order.', 409);
      tx.update(reference, { orderStatus: 'cancelled', cancelledAt: stamp(), updatedAt: stamp() });
      tx.create(db.collection('fulfilmentEvents').doc(), { orderId, actor: uid, from: order.orderStatus, to: 'cancelled', createdAt: stamp() });
    });
    res.json({ orderStatus: 'cancelled' });
  }));
  app.post('/orders/:orderId/allocate-stock', route(async (req, res) => {
    const uid = await identity(req); await requireAdmin(uid);
    const orderId = id(req.params.orderId), ref = db.doc(`orders/${orderId}`);
    await db.runTransaction(async tx => {
      const order = (await tx.get(ref)).data();
      if (!order || order.schemaVersion !== 2 || order.paymentEnvironment !== mode || !order.paymentVerified || order.paymentStatus !== 'paid' || order.orderStatus === 'cancelled') reject('This order cannot receive stock.', 409);
      if (order!.inventoryStatus === 'deducted') return;
      const items: { productId: string; quantity: number }[] = order!.items;
      const products = await Promise.all(items.map(item => tx.get(db.doc(`products/${item.productId}`))));
      if (products.some((p, i) => !p.exists || !Number.isInteger(p.data()?.stock) || p.data()!.stock < items[i].quantity)) reject('Stock is still insufficient. Record incoming stock first.', 409);
      products.forEach((product, i) => {
        const previous = product.data()!.stock, quantity = items[i].quantity;
        tx.update(product.ref, { stock: previous - quantity, version: Number(product.data()?.version || 0) + 1, updatedAt: stamp() });
        tx.create(db.doc(`inventoryMovements/sale-${orderId}-${items[i].productId}`), { productId: items[i].productId, orderId, type: 'sale', quantity,
          previousQuantity: previous, newQuantity: previous - quantity, actor: uid, paymentEnvironment: mode, note: 'Allocated after verified-payment stock review', createdAt: stamp() });
      });
      tx.update(ref, { inventoryStatus: 'deducted', updatedAt: stamp() });
      tx.create(db.collection('fulfilmentEvents').doc(), { orderId, actor: uid, from: order!.orderStatus, to: order!.orderStatus, note: 'Stock exception resolved; stock allocated', createdAt: stamp() });
    });
    res.json({ inventoryStatus: 'deducted' });
  }));
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next; // Express identifies error middleware by its four-argument signature.
    if (error instanceof CommerceError) { res.status(error.status).json({ error: error.message }); return; }
    if (error instanceof SyntaxError) { res.status(400).json({ error: 'Invalid request body.' }); return; }
    if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') { res.status(413).json({ error: 'The upload is too large. Choose an image smaller than 3 MB.' }); return; }
    console.error('Commerce request failed.');
    res.status(500).json({ error: 'The order could not be updated. Please check its status before trying again.' });
  });
  return app;
}
