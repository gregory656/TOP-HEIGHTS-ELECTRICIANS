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
import type { CartItem } from './cartService';
import { INTASEND_CONFIG, STK_PUSH_CONFIG } from '../config/intasendConfig';

export interface Order {
  id?: string;
  userId: string;
  email: string;
  phone: string;
  address: string;
  items: CartItem[];
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
    // Format phone number (remove +254 if present, add 254)
    const formattedPhone = phoneNumber.replace(/^\\+?254/, '254');
    
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
