import { createHash, timingSafeEqual } from 'node:crypto';

export class CommerceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const reject = (message: string, status = 400): never => { throw new CommerceError(status, message); };
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown, label: string, min: number, max: number) => {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) reject(`Invalid ${label}.`);
  return (value as string).trim();
};
export function money(value: unknown): number {
  const raw = typeof value === 'number' ? String(value) : value;
  if (typeof raw !== 'string' || !/^\d{1,9}(\.\d{1,2})?$/.test(raw)) return reject('Invalid monetary amount.');
  const [whole, fraction = ''] = raw.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export function parseOrder(input: unknown) {
  const data = record(input);
  const idempotencyKey = text(data.idempotencyKey, 'checkout reference', 16, 100);
  if (!/^[a-zA-Z0-9-]+$/.test(idempotencyKey)) reject('Invalid checkout reference.');
  const customer = record(data.customerInfo);
  const email = text(customer.email, 'email', 5, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) reject('Invalid email.');
  let phone = text(customer.phone, 'phone number', 9, 24).replace(/\s/g, '').replace(/^\+/, '');
  if (phone.startsWith('0')) phone = `254${phone.slice(1)}`;
  if (/^[17]\d{8}$/.test(phone)) phone = `254${phone}`;
  if (!/^254[17]\d{8}$/.test(phone)) reject('Enter a valid Kenyan phone number.');
  const customerInfo = {
    fullName: text(customer.fullName, 'name', 1, 120), email, phone,
    deliveryAddress: text(customer.deliveryAddress, 'town or delivery location', 2, 600),
    landmark: customer.landmark ? text(customer.landmark, 'landmark', 1, 300) : '',
  };
  if (!/\p{L}/u.test(customerInfo.deliveryAddress)) reject('Enter a town name or delivery location.');
  if (data.paymentMethod !== 'MPESA') reject('M-Pesa is currently the only available payment method.');
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 30) reject('Choose between 1 and 30 products.');
  const seen = new Set<string>();
  const items = (data.items as unknown[]).map(value => {
    const item = record(value);
    const productId = text(item.productId, 'product', 1, 100);
    if (!/^[a-zA-Z0-9_-]+$/.test(productId) || seen.has(productId)) reject('Invalid or duplicate product.');
    seen.add(productId);
    if (!Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 99) reject('Quantity must be between 1 and 99.');
    return { productId, quantity: Number(item.quantity) };
  }).sort((a, b) => a.productId.localeCompare(b.productId));
  return { idempotencyKey, customerInfo, paymentMethod: 'MPESA' as const, items };
}
export function priceOrder(request: ReturnType<typeof parseOrder>, products: Record<string, unknown>[], shipping: unknown) {
  const items = request.items.map((item, index) => {
    const product = products[index];
    if (!product || product.active !== true || product.published !== true || product.status !== 'active' || typeof product.name !== 'string') reject(`Product ${item.productId} is not available for checkout.`, 409);
    const priceMinor = money(product.price);
    if (priceMinor <= 0) reject('A product price needs attention.', 409);
    if (!Number.isInteger(product.stock) || Number(product.stock) < item.quantity) reject(`${product.name} is not available in that quantity.`, 409);
    return { ...item, name: product.name, price: priceMinor / 100, total: priceMinor * item.quantity / 100 };
  });
  const shippingMinor = money(shipping);
  const subtotalMinor = items.reduce((sum, item) => sum + money(item.total), 0);
  const totalMinor = subtotalMinor + shippingMinor;
  if (totalMinor <= 0 || totalMinor > 99999999900) reject('Order amount exceeds the checkout limit.');
  return { items, subtotal: subtotalMinor / 100, shippingFee: shippingMinor / 100, totalAmount: totalMinor / 100, totalMinor, currency: 'KES' };
}
export function verifyInvoice(payload: unknown, session: Record<string, unknown>, order: Record<string, unknown>) {
  const invoice = record(record(payload).invoice);
  const invoiceId = invoice.invoice_id ?? invoice.id;
  if (typeof invoiceId !== 'string' || !/^[a-zA-Z0-9_-]{1,150}$/.test(invoiceId)) reject('Payment confirmation is not available yet.', 409);
  if (invoice.api_ref !== session.apiRef || invoice.currency !== 'KES' || money(invoice.value) !== order.totalMinor) reject('Payment details do not match this order.', 409);
  if (!['PENDING', 'PROCESSING', 'COMPLETE', 'FAILED'].includes(String(invoice.state))) reject('Payment state is not recognised.', 409);
  return { invoiceId, state: String(invoice.state) };
}
export function validChallenge(received: unknown, expected: string) {
  return typeof received === 'string' && expected.length >= 32 && received.length <= 512
    && timingSafeEqual(Buffer.from(digest(received)), Buffer.from(digest(expected)));
}
export function checkoutUrl(value: unknown, mode: 'sandbox' | 'live') {
  if (typeof value !== 'string') return reject('Payment provider did not return a checkout URL.', 502);
  let url: URL;
  try { url = new URL(value); } catch { return reject('Invalid payment URL.', 502); }
  const hosts = mode === 'sandbox' ? ['sandbox.intasend.com'] : ['payment.intasend.com', 'pay.intasend.com'];
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !hosts.includes(url.hostname)) reject('Unexpected payment destination.', 502);
  return url.href;
}
export function fulfilmentChange(order: Record<string, unknown>, next: unknown) {
  if (next === 'cancelled' && ['pending', 'processed', 'ready'].includes(String(order.orderStatus))) return;
  if (order.schemaVersion !== 2 || order.paymentVerified !== true || order.paymentStatus !== 'paid' || order.paymentEnvironment !== 'live') reject('Only verified live payments can be fulfilled.', 409);
  if (order.inventoryStatus === 'review') reject('Resolve the stock exception before dispatching this order.', 409);
  const transitions: Record<string, string[]> = { processed: ['ready', 'shipped'], ready: ['shipped'], shipped: ['completed'], completed: [] };
  if (next === order.orderStatus) return;
  if (typeof next !== 'string' || !transitions[String(order.orderStatus)]?.includes(next)) reject('Invalid fulfilment transition.', 409);
}
