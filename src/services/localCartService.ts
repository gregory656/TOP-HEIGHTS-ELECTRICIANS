// src/services/localCartService.ts
// LocalStorage-based cart service for guest users or as fallback when Firestore fails

import type { Product } from '../data/products';

const LOCAL_CART_KEY = 'top_heights_cart';

export interface LocalCartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

/**
 * Get cart from localStorage
 */
export const getLocalCart = (): LocalCartItem[] => {
  try {
    const cartData = localStorage.getItem(LOCAL_CART_KEY);
    if (cartData) {
      return JSON.parse(cartData);
    }
    return [];
  } catch (error) {
    console.error('Error getting local cart:', error);
    return [];
  }
};

/**
 * Save cart to localStorage
 */
const saveLocalCart = (items: LocalCartItem[]): void => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving local cart:', error);
  }
};

/**
 * Add item to local cart
 */
export const addToLocalCart = (product: Product, quantity: number = 1): void => {
  const items = getLocalCart();
  const existingItemIndex = items.findIndex(
    (item) => item.productId === product.id
  );

  if (existingItemIndex >= 0) {
    // Item exists, increment quantity
    items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
  }

  saveLocalCart(items);
  console.log('Item added to local cart:', product.name);
};

/**
 * Update item quantity in local cart
 */
export const updateLocalCartItemQuantity = (
  productId: number,
  quantity: number
): void => {
  const items = getLocalCart();
  const updatedItems = items.map((item) =>
    item.productId === productId ? { ...item, quantity } : item
  );
  saveLocalCart(updatedItems);
};

/**
 * Remove item from local cart
 */
export const removeFromLocalCart = (productId: number): void => {
  const items = getLocalCart();
  const updatedItems = items.filter((item) => item.productId !== productId);
  saveLocalCart(updatedItems);
};

/**
 * Clear entire local cart
 */
export const clearLocalCart = (): void => {
  localStorage.removeItem(LOCAL_CART_KEY);
};

/**
 * Get local cart item count
 */
export const getLocalCartCount = (): number => {
  const items = getLocalCart();
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Calculate local cart total
 */
export const calculateLocalCartTotal = (): number => {
  const items = getLocalCart();
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export default {
  getLocalCart,
  addToLocalCart,
  updateLocalCartItemQuantity,
  removeFromLocalCart,
  clearLocalCart,
  getLocalCartCount,
  calculateLocalCartTotal,
};
