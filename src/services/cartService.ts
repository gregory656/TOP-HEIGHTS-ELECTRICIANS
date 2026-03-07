// src/services/cartService.ts
// Firestore per-user cart (source of truth):
// users/{uid}/cart/{productId}
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '../data/products';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const cartCollectionRef = (userId: string) => collection(db, 'users', userId, 'cart');
const cartItemDocRef = (userId: string, productId: string) =>
  doc(db, 'users', userId, 'cart', productId);

/**
 * One-time migration helper:
 * Legacy carts were stored at carts/{uid} with an "items" array.
 * This migrates them into users/{uid}/cart/{productId}.
 */
export const migrateLegacyCartIfPresent = async (userId: string): Promise<void> => {
  if (!userId) return;
  const legacyRef = doc(db, 'carts', userId);
  const legacySnap = await getDoc(legacyRef);
  if (!legacySnap.exists()) return;

  const legacy = legacySnap.data() as {
    items?: Array<{ productId: number; name: string; price: number; image: string; quantity: number }>;
  };
  const legacyItems = legacy.items || [];
  if (legacyItems.length === 0) return;

  const batch = writeBatch(db);
  const now = serverTimestamp();

  for (const item of legacyItems) {
    const pid = String(item.productId);
    batch.set(
      cartItemDocRef(userId, pid),
      {
        productId: pid,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        createdAt: now,
        updatedAt: now,
      } satisfies CartItem,
      { merge: true }
    );
  }

  await batch.commit();
};

/**
 * Get the user's cart from Firestore
 */
export const getCart = async (userId: string): Promise<CartItem[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(query(cartCollectionRef(userId), orderBy('updatedAt', 'desc')));
    return snap.docs.map((d) => d.data() as CartItem);
  } catch (error) {
    console.error('Error getting cart:', error);
    throw error;
  }
};

/**
 * Subscribe to cart changes in real-time
 */
export const subscribeToCart = (userId: string, callback: (items: CartItem[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(cartCollectionRef(userId), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => d.data() as CartItem));
    },
    (error) => {
      console.error('Cart subscription error:', error);
      callback([]);
    }
  );
};

/**
 * Add item to cart or increment quantity if exists
 */
export const addToCart = async (
  userId: string,
  product: Product,
  quantity: number = 1
): Promise<void> => {
  if (!userId) throw new Error('User must be authenticated to add items to cart');
  if (quantity < 1) return;

  const productId = String(product.id);
  const itemRef = cartItemDocRef(userId, productId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(itemRef);
    const now = serverTimestamp();

    if (snap.exists()) {
      const existing = snap.data() as CartItem;
      const newQty = (existing.quantity || 0) + quantity;
      tx.update(itemRef, { quantity: newQty, updatedAt: now });
      return;
    }

    tx.set(itemRef, {
      productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      createdAt: now,
      updatedAt: now,
    } satisfies CartItem);
  });
};

/**
 * Update item quantity in cart (min = 1 enforced by caller)
 */
export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<void> => {
  if (!userId) throw new Error('User ID is required');
  if (quantity < 1) throw new Error('Quantity must be at least 1');

  await updateDoc(cartItemDocRef(userId, String(productId)), {
    quantity,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId: string, productId: string): Promise<void> => {
  if (!userId) throw new Error('User ID is required');
  await deleteDoc(cartItemDocRef(userId, String(productId)));
};

/**
 * Clear entire cart (delete all cart item docs)
 */
export const clearCart = async (userId: string): Promise<void> => {
  if (!userId) throw new Error('User ID is required');

  const snap = await getDocs(cartCollectionRef(userId));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};

/**
 * Calculate cart total
 */
export const calculateCartTotal = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

/**
 * Convenience: get total quantity (badge count)
 */
export const calculateCartCount = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0);

export default {
  getCart,
  subscribeToCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  calculateCartTotal,
  calculateCartCount,
};
