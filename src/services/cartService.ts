// src/services/cartService.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '../data/products';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

/**
 * Get the user's cart from Firestore
 */
export const getCart = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartDocRef = doc(db, 'carts', userId);
    const cartDoc = await getDoc(cartDocRef);
    
    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      return cartData.items || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

/**
 * Subscribe to cart changes in real-time
 */
export const subscribeToCart = (
  userId: string,
  callback: (items: CartItem[]) => void
) => {
  const cartDocRef = doc(db, 'carts', userId);
  
  return onSnapshot(cartDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const cartData = docSnap.data();
      callback(cartData.items || []);
    } else {
      callback([]);
    }
  });
};

/**
 * Add item to cart or increment quantity if exists
 */
export const addToCart = async (userId: string, product: Product, quantity: number = 1): Promise<void> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to add to cart');
    }
    
    const cartDocRef = doc(db, 'carts', userId);
    const cartDoc = await getDoc(cartDocRef);
    
    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    };
    
    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const items: CartItem[] = cartData?.items || [];
      const existingItemIndex = items.findIndex(
        (item) => item.productId === product.id
      );
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += quantity;
        await updateDoc(cartDocRef, { 
          items: updatedItems,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Item doesn't exist, add new item
        await updateDoc(cartDocRef, {
          items: [...items, cartItem],
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      // Cart doesn't exist, create new cart
      await setDoc(cartDocRef, {
        userId,
        items: [cartItem],
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    
    console.log('Item added to cart successfully:', product.name);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = async (
  userId: string,
  productId: number,
  quantity: number
): Promise<void> => {
  try {
    const cartDocRef = doc(db, 'carts', userId);
    const cartDoc = await getDoc(cartDocRef);
    
    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const updatedItems = cartData.items.map((item: CartItem) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      await updateDoc(cartDocRef, { items: updatedItems });
    }
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId: string, productId: number): Promise<void> => {
  try {
    const cartDocRef = doc(db, 'carts', userId);
    const cartDoc = await getDoc(cartDocRef);
    
    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const updatedItems = cartData.items.filter(
        (item: CartItem) => item.productId !== productId
      );
      await updateDoc(cartDocRef, { items: updatedItems });
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (userId: string): Promise<void> => {
  try {
    const cartDocRef = doc(db, 'carts', userId);
    await updateDoc(cartDocRef, { items: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Delete entire cart document
 */
export const deleteCart = async (userId: string): Promise<void> => {
  try {
    const cartDocRef = doc(db, 'carts', userId);
    await deleteDoc(cartDocRef);
  } catch (error) {
    console.error('Error deleting cart:', error);
    throw error;
  }
};

/**
 * Calculate cart total
 */
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export default {
  getCart,
  subscribeToCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  deleteCart,
  calculateCartTotal,
};
