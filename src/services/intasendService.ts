import { INTASEND_CONFIG } from '../config/intasendConfig';

type IntaSendEvent = 'COMPLETE' | 'FAILED' | 'IN-PROGRESS';
type IntaSendHandler = () => void | Promise<void>;

type IntaSendInstance = {
  on: (event: IntaSendEvent, handler: IntaSendHandler) => IntaSendInstance;
};

type IntaSendConstructor = new (options: { publicAPIKey: string; live: boolean }) => IntaSendInstance;

type CheckoutWindow = Window & {
  IntaSend?: IntaSendConstructor;
};

const SDK_URL = 'https://unpkg.com/intasend-inlinejs-sdk@4.0.7/build/intasend-inline.js';
const BUTTON_CLASS = 'intaSendPayButton';

let sdkLoadingPromise: Promise<IntaSendConstructor> | null = null;

const loadIntaSendSdk = async (): Promise<IntaSendConstructor> => {
  if (typeof window === 'undefined') {
    throw new Error('IntaSend checkout requires a browser environment');
  }

  const w = window as CheckoutWindow;
  if (w.IntaSend) return w.IntaSend;
  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise<IntaSendConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-intasend-sdk="true"], script[src*="intasend-inline.js"]`
    );

    if (existing) {
      const checkInterval = setInterval(() => {
        if (w.IntaSend) {
          clearInterval(checkInterval);
          resolve(w.IntaSend);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (w.IntaSend) {
          resolve(w.IntaSend);
        } else {
          reject(new Error('IntaSend SDK loading timed out'));
        }
      }, 10000);

      return;
    }

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.dataset.intasendSdk = 'true';
    script.onload = () => {
      setTimeout(() => {
        if (w.IntaSend) {
          resolve(w.IntaSend);
        } else {
          reject(new Error('IntaSend SDK loaded but window.IntaSend unavailable'));
        }
      }, 500);
    };
    script.onerror = () => reject(new Error('Failed to load IntaSend SDK'));
    document.body.appendChild(script);
  });

  return sdkLoadingPromise;
};

const ensurePaymentButton = (): HTMLButtonElement => {
  let button = document.querySelector<HTMLButtonElement>(`.${BUTTON_CLASS}`);
  if (button && button.isConnected) return button;

  button = document.createElement('button');
  button.type = 'button';
  button.className = BUTTON_CLASS;
  button.style.display = 'none';
  document.body.appendChild(button);
  return button;
};

export type IntaSendStatus = IntaSendEvent;

export interface IntaSendCallbacks {
  onComplete?: () => void | Promise<void>;
  onFailed?: () => void | Promise<void>;
  onStatusChange?: (status: IntaSendStatus) => void;
}

interface TriggerParams {
  checkoutOrderId: string;
  amount: number;
  email: string;
  phone: string;
  callbacks?: IntaSendCallbacks;
}

export const triggerIntaSendPayment = async (options: TriggerParams): Promise<void> => {
  if (!INTASEND_CONFIG.PUBLIC_KEY) {
    throw new Error('IntaSend public key is not configured');
  }

  const button = ensurePaymentButton();
  button.setAttribute('data-amount', String(options.amount));
  button.setAttribute('data-currency', 'KES');
  button.setAttribute('data-email', options.email);
  button.setAttribute('data-phone_number', options.phone);
  button.setAttribute('data-api_ref', options.checkoutOrderId);

  const IntaSend = await loadIntaSendSdk();

  new IntaSend({
    publicAPIKey: INTASEND_CONFIG.PUBLIC_KEY,
    live: true,
  })
    .on('COMPLETE', async () => {
      options.callbacks?.onStatusChange?.('COMPLETE');
      await options.callbacks?.onComplete?.();
    })
    .on('FAILED', async () => {
      options.callbacks?.onStatusChange?.('FAILED');
      await options.callbacks?.onFailed?.();
    })
    .on('IN-PROGRESS', () => {
      options.callbacks?.onStatusChange?.('IN-PROGRESS');
    });

  button.click();
};
