// src/services/orderService.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { getCart, type CartItem } from './cartService';
import { INTASEND_CONFIG, STK_PUSH_CONFIG } from '../config/intasendConfig';

export interface Order {
  id?: string;
  orderId?: string;
  userId: string;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    deliveryAddress: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'MPESA' | 'INTASEND';
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processed' | 'shipped' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  invoiceId?: string;
  checkoutId?: string;
  mpesaReceiptNumber?: string;
}

const getShippingFee = async (): Promise<number> => {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    if (!settingsSnap.exists()) return 0;
    const data = settingsSnap.data() as { shippingFee?: number };
    return typeof data.shippingFee === 'number' ? data.shippingFee : 0;
  } catch {
    return 0;
  }
};

/**
 * Create a new pending order from the user's Firestore cart (DB is source of truth).
 * This recalculates totals from Firestore state at time of checkout.
 */
export const createPendingOrderFromCart = async (params: {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: Order['paymentMethod'];
}): Promise<{ orderId: string; totalAmount: number }> => {
  const { userId, fullName, email, phone, address, paymentMethod } = params;
  if (!userId) throw new Error('User must be logged in');

  const cartItems = await getCart(userId);
  if (cartItems.length === 0) throw new Error('Cart is empty');

  // Optional price re-validation: if products collection exists, prefer it
  const validated = await Promise.all(
    cartItems.map(async (item) => {
      try {
        const productSnap = await getDoc(doc(db, 'products', item.productId));
        if (productSnap.exists()) {
          const p = productSnap.data() as { price?: number; name?: string; images?: string[]; image?: string };
          const price = typeof p.price === 'number' ? p.price : item.price;
          const name = typeof p.name === 'string' ? p.name : item.name;
          const image =
            (Array.isArray(p.images) && typeof p.images[0] === 'string' && p.images[0]) ||
            (typeof p.image === 'string' && p.image) ||
            item.image;
          return { ...item, price, name, image };
        }
      } catch {
        // ignore and use cart snapshot
      }
      return item;
    })
  );

  const items = validated.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    total: i.price * i.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const shippingFee = await getShippingFee();
  const totalAmount = subtotal + shippingFee;

  const ordersRef = collection(db, 'orders');
  const docRef = await addDoc(ordersRef, {
    userId,
    orderId: '', // filled after creation
    customerInfo: {
      fullName,
      phone,
      email,
      deliveryAddress: address,
    },
    items,
    subtotal,
    shippingFee,
    totalAmount,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await updateDoc(doc(db, 'orders', docRef.id), {
    orderId: docRef.id,
    updatedAt: Timestamp.now(),
  });

  return { orderId: docRef.id, totalAmount };
};

/** Create order from provided items (e.g. from localStorage cart). Use for checkout. */
export const createOrderWithItems = async (params: {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: Order['paymentMethod'];
  items: Array<{ productId: string; name: string; price: number; image?: string; quantity: number }>;
}): Promise<{ orderId: string; totalAmount: number }> => {
  const { userId, fullName, email, phone, address, paymentMethod, items } = params;
  if (!userId || items.length === 0) throw new Error('User and items required');

  const orderItems = items.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    total: i.price * i.quantity,
  }));
  const subtotal = orderItems.reduce((s, i) => s + i.total, 0);
  const shippingFee = await getShippingFee();
  const totalAmount = subtotal + shippingFee;

  const ordersRef = collection(db, 'orders');
  const docRef = await addDoc(ordersRef, {
    userId,
    orderId: '',
    customerInfo: { fullName, phone, email, deliveryAddress: address },
    items: orderItems,
    subtotal,
    shippingFee,
    totalAmount,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  await updateDoc(doc(db, 'orders', docRef.id), {
    orderId: docRef.id,
    updatedAt: Timestamp.now(),
  });
  return { orderId: docRef.id, totalAmount };
};

/**
 * Create a new order in Firestore
 */
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  updates: Partial<Pick<Order, 'paymentStatus' | 'orderStatus' | 'invoiceId' | 'checkoutId' | 'mpesaReceiptNumber'>>
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

/**
 * Get all orders for a user
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

/**
 * Subscribe to user's orders in real-time
 */
export const subscribeToUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void
) => {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
    callback(orders);
  });
};

/**
 * Initiate IntaSend STK Push payment
 * 
 * SECURITY NOTE: In production, this should be done on a secure backend
 * to protect the secret key. This is for demonstration purposes only.
 */
export const initiateSTKPush = async (
  orderId: string,
  phoneNumber: string,
  amount: number,
  email: string
): Promise<{ checkoutId: string; invoiceId: string }> => {
  try {
    // Format phone: 07xxx / +2547xxx / 2547xxx -> 2547xxxxxxxx
    let formattedPhone = phoneNumber.replace(/\s/g, '');
    if (/^\+/.test(formattedPhone)) formattedPhone = formattedPhone.slice(1);
    if (/^0/.test(formattedPhone)) formattedPhone = '254' + formattedPhone.slice(1);
    if (!/^254/.test(formattedPhone)) formattedPhone = '254' + formattedPhone;
    
    const requestBody = {
      method: STK_PUSH_CONFIG.METHOD,
      currency: STK_PUSH_CONFIG.CURRENCY,
      amount: amount,
      phone_number: formattedPhone,
      email: email,
      merchant_shortcode: INTASEND_CONFIG.MERCHANT_SHORTCODE,
      callback_url: STK_PUSH_CONFIG.CALLBACK_URL,
      api_ref: orderId,
    };

    console.log('Initiating STK Push with config:', {
      ...requestBody,
      secret_key: '***HIDDEN***',
    });

    const response = await fetch(
      `${INTASEND_CONFIG.API_BASE_URL}/api/v1/checkout/stk-push/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${INTASEND_CONFIG.SECRET_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('IntaSend API error:', errorData);
      throw new Error(errorData.message || 'Failed to initiate STK push');
    }

    const data = await response.json();
    console.log('STK Push response:', data);

    // Update order with checkout and invoice IDs
    await updateOrderStatus(orderId, {
      checkoutId: data.checkout_id,
      invoiceId: data.invoice_id,
      paymentStatus: 'processing',
    });

    return {
      checkoutId: data.checkout_id,
      invoiceId: data.invoice_id,
    };
  } catch (error) {
    console.error('Error initiating STK push:', error);
    throw error;
  }
};

/**
 * Check payment status from IntaSend
 * 
 * SECURITY NOTE: In production, this should be done on a secure backend
 */
export const checkPaymentStatus = async (
  checkoutId: string
): Promise<{ status: string; invoice?: { state: string } }> => {
  try {
    const response = await fetch(
      `${INTASEND_CONFIG.API_BASE_URL}/api/v1/checkout/${checkoutId}/status/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${INTASEND_CONFIG.SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

/**
 * Poll for payment completion
 */
export const pollPaymentStatus = async (
  checkoutId: string,
  orderId: string,
  onStatusChange: (status: string) => void,
  maxAttempts: number = 30,
  intervalMs: number = 3000
): Promise<boolean> => {
  let attempts = 0;
  
  return new Promise((resolve) => {
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const statusData = await checkPaymentStatus(checkoutId);
        const state = statusData.invoice?.state || statusData.status;
        
        onStatusChange(state);
        
        // Check if payment is complete
        if (state === 'COMPLETED' || state === 'paid' || state === 'settled') {
          clearInterval(pollInterval);
          
          // Update order as paid
          await updateOrderStatus(orderId, {
            paymentStatus: 'paid',
            orderStatus: 'processed',
          });
          
          resolve(true);
          return;
        }
        
        // Check if payment failed
        if (state === 'FAILED' || state === 'failed' || state === 'cancelled') {
          clearInterval(pollInterval);
          
          await updateOrderStatus(orderId, {
            paymentStatus: 'failed',
          });
          
          resolve(false);
          return;
        }
        
        // Max attempts reached
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          resolve(false);
        }
      } catch (error) {
        console.error('Poll error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          resolve(false);
        }
      }
    }, intervalMs);
  });
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

/**
 * Subscribe to all orders (admin only)
 */
export const subscribeToAllOrders = (
  callback: (orders: Order[]) => void
) => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
    callback(orders);
  });
};

export default {
  createOrder,
  updateOrderStatus,
  getOrderById,
  getUserOrders,
  subscribeToUserOrders,
  initiateSTKPush,
  checkPaymentStatus,
  pollPaymentStatus,
  getAllOrders,
  subscribeToAllOrders,
};
