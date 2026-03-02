// src/services/whatsappService.ts
// WhatsApp order service for guest users

import type { Product } from '../data/products';
import type { CartItem } from './cartService';
import type { LocalCartItem } from './localCartService';

// Business WhatsApp number (replace with actual business number)
// Format: country code + number without + sign (e.g., 254712345678)
export const BUSINESS_WHATSAPP_NUMBER = '254704945497';

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  price: number;
}

/**
 * Format price to KES currency
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Generate WhatsApp message for a single product order
 */
export const generateProductWhatsAppMessage = (
  product: Product,
  quantity: number = 1,
  customerPhone?: string
): string => {
  const total = product.price * quantity;
  
  let message = `*TOP HEIGHTS ELECTRICIANS - ORDER REQUEST*\n\n`;
  message += `*Product Details:*\n`;
  message += `• Product: ${product.name}\n`;
  message += `• Quantity: ${quantity}\n`;
  message += `• Unit Price: ${formatPrice(product.price)}\n`;
  message += `• Total: ${formatPrice(total)}\n\n`;
  
  if (customerPhone) {
    message += `*Customer Phone:* ${customerPhone}\n\n`;
  }
  
  message += `-----------------------------------\n`;
  message += `Please confirm availability and delivery details.\n`;
  message += `Thank you for choosing Top Heights Electricians!`;
  
  return encodeURIComponent(message);
};

/**
 * Generate WhatsApp message for cart items
 */
export const generateCartWhatsAppMessage = (
  items: CartItem[] | LocalCartItem[],
  customerPhone?: string
): string => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let message = `*TOP HEIGHTS ELECTRICIANS - ORDER REQUEST*\n\n`;
  message += `*Order Details:*\n`;
  message += `-----------------------------------\n`;
  
  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    message += `${index + 1}. ${item.name}\n`;
    message += `   Quantity: ${item.quantity} x ${formatPrice(item.price)}\n`;
    message += `   Subtotal: ${formatPrice(itemTotal)}\n\n`;
  });
  
  message += `-----------------------------------\n`;
  message += `*TOTAL: ${formatPrice(total)}*\n`;
  message += `-----------------------------------\n\n`;
  
  if (customerPhone) {
    message += `*Customer Phone:* ${customerPhone}\n\n`;
  }
  
  message += `Please confirm availability and delivery details.\n`;
  message += `Thank you for choosing Top Heights Electricians!`;
  
  return encodeURIComponent(message);
};

/**
 * Generate WhatsApp message for a custom order request
 */
export const generateCustomOrderWhatsAppMessage = (
  message: string,
  customerPhone?: string
): string => {
  let fullMessage = `*TOP HEIGHTS ELECTRICIANS - CUSTOM ORDER REQUEST*\n\n`;
  
  if (customerPhone) {
    fullMessage += `*Customer Phone:* ${customerPhone}\n\n`;
  }
  
  fullMessage += `*Message:*\n${message}\n\n`;
  fullMessage += `-----------------------------------\n`;
  fullMessage += `Please respond to this inquiry.\n`;
  fullMessage += `Thank you for choosing Top Heights Electricians!`;
  
  return encodeURIComponent(fullMessage);
};

/**
 * Open WhatsApp with pre-filled message for a product
 */
export const orderViaWhatsApp = (
  product: Product,
  quantity: number = 1,
  customerPhone?: string
): void => {
  const message = generateProductWhatsAppMessage(product, quantity, customerPhone);
  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Open WhatsApp with pre-filled message for cart items
 */
export const orderCartViaWhatsApp = (
  items: CartItem[] | LocalCartItem[],
  customerPhone?: string
): void => {
  const message = generateCartWhatsAppMessage(items, customerPhone);
  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Open WhatsApp with custom message
 */
export const contactViaWhatsApp = (
  message: string,
  customerPhone?: string
): void => {
  const encodedMessage = generateCustomOrderWhatsAppMessage(message, customerPhone);
  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

export default {
  BUSINESS_WHATSAPP_NUMBER,
  generateProductWhatsAppMessage,
  generateCartWhatsAppMessage,
  generateCustomOrderWhatsAppMessage,
  orderViaWhatsApp,
  orderCartViaWhatsApp,
  contactViaWhatsApp,
};
