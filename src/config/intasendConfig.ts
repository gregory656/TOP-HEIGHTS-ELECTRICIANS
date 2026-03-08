// src/config/intasendConfig.ts
/**
 * IntaSend Payment Configuration (Live keys integrated)
 * Optional: use .env with VITE_INTASEND_SECRET_KEY / VITE_INTASEND_PUBLIC_KEY and add .env to .gitignore
 */

const getEnv = (key: string, fallback: string) =>
  (typeof import.meta.env !== 'undefined' && (import.meta.env as Record<string, string>)[key]) || fallback;

export const INTASEND_CONFIG = {
  PUBLIC_KEY: getEnv('VITE_INTASEND_PUBLIC_KEY', 'ISPubKey_live_4afe8583-34a1-4220-a709-35733ebdf74b'),
  SECRET_KEY: getEnv('VITE_INTASEND_SECRET_KEY', 'ISSecretKey_live_bc9715ff-deda-47a6-a54e-c1455e12ef81'),
  MERCHANT_SHORTCODE: getEnv('VITE_INTASEND_MERCHANT_SHORTCODE', ''),
  API_BASE_URL: 'https://payment.intasend.com',
  CHECKOUT_URL: 'https://payment.intasend.com',
  FUNCTIONS_API_BASE_URL: getEnv(
    'VITE_FUNCTIONS_API_BASE_URL',
    'https://us-central1-top-heights-electricals.cloudfunctions.net/api'
  ),
};

export const STK_PUSH_CONFIG = {
  CURRENCY: 'KES',
  CALLBACK_URL: typeof window !== 'undefined' ? window.location.origin + '/payment-callback' : '',
  METHOD: 'MPESA',
};

export default INTASEND_CONFIG;
