// src/config/intasendConfig.ts
/**
 * IntaSend Payment Configuration
 * 
 * SECURITY NOTE: These keys are frontend-exposed. In production,
 * STK push requests should be handled by a secure backend server
 * to protect your secret keys.
 * 
 * Get your keys from: https://intasend.com/
 */

// Replace with your actual IntaSend keys
export const INTASEND_CONFIG = {
  // Public key - safe to use on frontend
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY_HERE',
  
  // Secret key - WARNING: Only use for testing, move to backend in production!
  SECRET_KEY: 'YOUR_SECRET_KEY_HERE',
  
  // Merchant shortcode (provided by IntaSend)
  MERCHANT_SHORTCODE: 'YOUR_MERCHANT_SHORTCODE',
  
  // API base URL
  API_BASE_URL: 'https://sandbox.intasend.com', // Use 'https://payment.intasend.com' for production
  
  // Checkout URL
  CHECKOUT_URL: 'https://sandbox.intasend.com', // Use 'https://payment.intasend.com' for production
};

// STK Push request configuration
export const STK_PUSH_CONFIG = {
  // Currency code (KES for Kenya Shillings)
  CURRENCY: 'KES',
  
  // Callback URL for payment status
  CALLBACK_URL: window.location.origin + '/payment-callback',
  
  // Default payment method
  METHOD: 'MPESA',
};

export default INTASEND_CONFIG;
