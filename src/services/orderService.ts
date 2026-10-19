import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { normalizeOrder, orderTime, type Order } from './orderModel';
export type { Order } from './orderModel';

async function api<T>(path: string, body: unknown = {}, method = 'POST'): Promise<T> {
  const base = (import.meta.env.VITE_COMMERCE_API_URL || '').replace(/\/+$/, '');
  if (!base) throw new Error('Online checkout is not available yet. Please contact the shop to arrange your order.');
  if (!auth.currentUser) throw new Error('Please sign in to continue.');
  const response = await fetch(`${base}${path}`, { method, signal: AbortSignal.timeout(35000),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser.getIdToken()}` }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Could not confirm the order. Please check its status before trying again.');
  return data as T;
}
export type OrderQuote = { orderId: string; items: Order['items']; subtotal: number; shippingFee: number; totalAmount: number; paymentEnvironment: Order['paymentEnvironment']; paymentStatus: Order['paymentStatus']; orderStatus?: Order['orderStatus'] };
export async function createOrderWithItems(params: {
  userId: string; fullName: string; email: string; phone: string; address: string; landmark?: string; paymentMethod: 'MPESA';
  items: { productId: string; quantity: number }[];
}): Promise<OrderQuote> {
  if (auth.currentUser?.uid !== params.userId) throw new Error('Your account changed. Please reopen checkout.');
  const payload = { customerInfo: { fullName: params.fullName, email: params.email, phone: params.phone, deliveryAddress: params.address, landmark: params.landmark || '' },
    paymentMethod: params.paymentMethod, items: params.items.map(({ productId, quantity }) => ({ productId, quantity })) };
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
  const storageKey = `topheights-checkout-${params.userId}`;
  let saved: { fingerprint?: string; idempotencyKey?: string; orderId?: string } = {};
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch { /* Invalid local state creates a fresh checkout. */ }
  if (saved.fingerprint !== fingerprint || !saved.idempotencyKey) saved = { fingerprint, idempotencyKey: crypto.randomUUID() };
  sessionStorage.setItem(storageKey, JSON.stringify(saved));
  let quote = await api<OrderQuote>('/orders', { ...payload, idempotencyKey: saved.idempotencyKey });
  // Webhooks can finish an order without a browser refresh. A later identical purchase
  // must receive a new order rather than reusing the already-paid checkout reference.
  if (quote.paymentStatus === 'paid' || quote.orderStatus === 'cancelled') {
    saved = { fingerprint, idempotencyKey: crypto.randomUUID() };
    sessionStorage.setItem(storageKey, JSON.stringify(saved));
    quote = await api<OrderQuote>('/orders', { ...payload, idempotencyKey: saved.idempotencyKey });
  }
  sessionStorage.setItem(storageKey, JSON.stringify({ ...saved, orderId: quote.orderId }));
  return quote;
}
export const startOrderPayment = (orderId: string) => api<{ url?: string; paymentStatus: Order['paymentStatus'] }>(`/orders/${encodeURIComponent(orderId)}/payment`);
export async function refreshOrderPayment(orderId: string) {
  const result = await api<{ paymentStatus: Order['paymentStatus']; paymentVerified: boolean }>(`/orders/${encodeURIComponent(orderId)}/status`);
  if (result.paymentStatus === 'paid' && result.paymentVerified && auth.currentUser) {
    const key = `topheights-checkout-${auth.currentUser.uid}`;
    try { if (JSON.parse(sessionStorage.getItem(key) || '{}').orderId === orderId) sessionStorage.removeItem(key); } catch { /* No checkout to reset. */ }
  }
  return result;
}
export const updateFulfilment = (orderId: string, orderStatus: Order['orderStatus']) => api(`/orders/${encodeURIComponent(orderId)}/fulfilment`, { orderStatus }, 'PATCH');
export const cancelOrder = (orderId: string) => api(`/orders/${encodeURIComponent(orderId)}/cancel`);
export { api as commerceApi };
export async function getOrderById(orderId: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(db, 'orders', orderId));
  return snapshot.exists() ? normalizeOrder(snapshot.id, snapshot.data()) : null;
}
function subscribe(userId: string | null, callback: (orders: Order[]) => void, onError?: (error: Error) => void) {
  const orders = collection(db, 'orders');
  // Sorting locally avoids an undeployed composite-index dependency for customer history.
  return onSnapshot(userId ? query(orders, where('userId', '==', userId)) : orders, snapshot => {
    callback(snapshot.docs.map(doc => normalizeOrder(doc.id, doc.data())).sort((a, b) => orderTime(b.createdAt) - orderTime(a.createdAt)));
  }, error => { callback([]); onError?.(error); });
}
export const subscribeToUserOrders = (userId: string, callback: (orders: Order[]) => void, onError?: (error: Error) => void) => subscribe(userId, callback, onError);
export const subscribeToAllOrders = (callback: (orders: Order[]) => void, onError?: (error: Error) => void) => subscribe(null, callback, onError);
