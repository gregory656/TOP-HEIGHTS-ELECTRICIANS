// src/context/CartContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../data/products';

const CART_KEY = 'top_heights_cart';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

type CartContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const productId = String(product.id);
    setCartItems((prev) => {
      const i = prev.findIndex((x) => x.productId === productId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setCartItems((prev) => prev.filter((x) => x.productId !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity } : x))
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const value: CartContextValue = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
