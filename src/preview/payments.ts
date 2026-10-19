// No live configuration, database imports or payment SDK in the preview bundle.
import { normalizeOrder, type Order } from '../services/orderModel';

async function disabled(): Promise<never> { throw new Error('Client preview: orders and payments are disabled. No order has been placed and no payment requested.'); }
export const INTASEND_CONFIG = { PUBLIC_KEY: '', TEST_MODE: true };
export const createOrderWithItems = disabled;
export const createPendingOrderFromCart = disabled;
export const createOrder = disabled;
export const updateOrderStatus = disabled;
export const initiateSTKPush = disabled;
export const checkPaymentStatus = disabled;
export const pollPaymentStatus = disabled;
export const triggerIntaSendPayment = disabled;
export const startOrderPayment = disabled;
export const refreshOrderPayment = disabled;
export const updateFulfilment = disabled;
export const cancelOrder = disabled;
export const commerceApi = disabled;
export const getOrderById = async () => null;
export const getUserOrders = async () => [];
export const getAllOrders = async () => [];
const sampleOrder = normalizeOrder('demo-order', {
  orderId: 'DEMO-001', userId: 'preview-customer', schemaVersion: 2,
  customerInfo: { fullName: 'Demo Customer', email: 'customer@example.test', phone: 'Demo only', deliveryAddress: 'Thika' },
  items: [{ productId: '1', name: 'Mono Solar Panel 550W', price: 18500, quantity: 1, total: 18500 }],
  subtotal: 18500, shippingFee: 0, totalAmount: 18500, paymentMethod: 'INTASEND',
  paymentStatus: 'pending', paymentVerified: false, paymentEnvironment: 'sandbox', orderStatus: 'pending', createdAt: '2026-09-20',
});
export const subscribeToUserOrders = (_userId: string, callback: (orders: Order[]) => void) => { callback([sampleOrder]); return () => {}; };
export const subscribeToAllOrders = (callback: (orders: Order[]) => void) => { callback([sampleOrder]); return () => {}; };
