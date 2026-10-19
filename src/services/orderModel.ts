export type Order = {
  id: string; orderId: string; userId: string; schemaVersion?: number;
  customerInfo: { fullName: string; phone: string; email: string; deliveryAddress: string; landmark?: string };
  items: { productId: string; name: string; price: number; quantity: number; total: number }[];
  subtotal: number; shippingFee: number; totalAmount: number;
  paymentMethod: 'MPESA' | 'INTASEND';
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'unverified' | 'refunded';
  paymentVerified: boolean; paymentEnvironment: 'live' | 'sandbox' | 'legacy';
  orderStatus: 'pending' | 'processed' | 'ready' | 'shipped' | 'completed' | 'cancelled';
  createdAt: unknown; updatedAt: unknown; invoiceId?: string;
  paidAt?: unknown; cancelledAt?: unknown; inventoryStatus?: string; refundReviewRequired?: boolean;
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
const string = (value: unknown) => typeof value === 'string' ? value : '';
const amount = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
export function normalizeOrder(id: string, input: unknown): Order {
  const data = object(input), customer = object(data.customerInfo);
  const verified = data.schemaVersion === 2 && data.paymentVerified === true;
  const paymentStatus = data.paymentStatus === 'paid' && !verified ? 'unverified'
    : ['pending', 'processing', 'paid', 'failed', 'refunded'].includes(string(data.paymentStatus)) ? data.paymentStatus as Order['paymentStatus'] : 'pending';
  return {
    id, orderId: string(data.orderId) || id, userId: string(data.userId), schemaVersion: Number(data.schemaVersion) || undefined,
    customerInfo: { fullName: string(customer.fullName) || string(data.customerName), email: string(customer.email) || string(data.customerEmail),
      phone: string(customer.phone) || string(data.phone), deliveryAddress: string(customer.deliveryAddress) || string(data.deliveryAddress), landmark: string(customer.landmark) },
    items: (Array.isArray(data.items) ? data.items : []).map(value => { const item = object(value); return {
      productId: string(item.productId), name: string(item.name), price: amount(item.price), quantity: amount(item.quantity), total: amount(item.total),
    }; }),
    subtotal: amount(data.subtotal), shippingFee: amount(data.shippingFee), totalAmount: amount(data.totalAmount),
    paymentMethod: data.paymentMethod === 'MPESA' ? 'MPESA' : 'INTASEND', paymentStatus, paymentVerified: verified,
    paymentEnvironment: data.paymentEnvironment === 'live' || data.paymentEnvironment === 'sandbox' ? data.paymentEnvironment : 'legacy',
    orderStatus: ['pending', 'processed', 'ready', 'shipped', 'completed', 'cancelled'].includes(string(data.orderStatus)) ? data.orderStatus as Order['orderStatus'] : 'pending',
    createdAt: data.createdAt, updatedAt: data.updatedAt, invoiceId: string(data.invoiceId) || undefined,
    paidAt: data.paidAt, cancelledAt: data.cancelledAt, inventoryStatus: string(data.inventoryStatus), refundReviewRequired: data.refundReviewRequired === true,
  };
}
export const isVerifiedSale = (order: Order) => order.paymentStatus === 'paid' && order.paymentVerified && order.paymentEnvironment === 'live';
export const fulfilmentLabels: Record<Order['orderStatus'], string> = { pending: 'New', processed: 'Processing', ready: 'Ready for dispatch', shipped: 'Dispatched', completed: 'Delivered', cancelled: 'Cancelled' };
export const paymentLabels: Record<Order['paymentStatus'], string> = { pending: 'Awaiting payment', processing: 'Verifying payment', paid: 'Payment successful', failed: 'Payment failed', unverified: 'Unverified', refunded: 'Refunded' };
export function orderTime(value: unknown): number {
  const timestamp = object(value);
  if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp.seconds === 'number') return timestamp.seconds * 1000;
  return typeof value === 'string' || typeof value === 'number' ? new Date(value).getTime() || 0 : 0;
}
export const formatOrderDate = (value: unknown) => orderTime(value) ? new Date(orderTime(value)).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Awaiting confirmation';
