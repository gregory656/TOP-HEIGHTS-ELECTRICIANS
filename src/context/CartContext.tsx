import React, { createContext, useState, ReactNode } from 'react';

// Define the shape of a single item in the cart
export interface CartItem {
  id: string; // Assuming product has a unique ID
  name: string;
  price: number;
  quantity: number;
  // Add other product properties you might need, like an image
  photoURL?: string;
}

// Define the shape of the context
export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  // You can add more functions here later (e.g., removeFromCart, clearCart)
}

// Create the context and export it so hooks in other files can consume it
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // If the item is already in the cart, just increment its quantity
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If it's a new item, add it to the cart with a quantity of 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const value = {
    cartItems,
    addToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};