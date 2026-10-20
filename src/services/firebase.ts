// src/services/firebase.ts
import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import type { Analytics } from 'firebase/analytics';
import { createAnalyticsController } from './privacyPreferences';
import { getFirestore, Firestore, initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration for Top Heights Electricals
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'not-configured',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-topheights-commerce',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
export const firebaseAuthConfigured = useEmulators || Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY
  && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  && import.meta.env.VITE_FIREBASE_PROJECT_ID
  && import.meta.env.VITE_FIREBASE_APP_ID
);

// Initialize Firebase app
let app: FirebaseApp;
try {
  app = getApp();
} catch {
  app = initializeApp(useEmulators ? { apiKey: 'demo-api-key', projectId: 'demo-topheights-commerce', authDomain: 'demo-topheights-commerce.firebaseapp.com', storageBucket: 'demo-topheights-commerce.appspot.com' } : firebaseConfig);
}

// Analytics is imported and initialized only after an explicit optional-analytics choice.
let analytics: Analytics | undefined;
const applyAnalyticsChoice = createAnalyticsController(async () => {
  const sdk = await import('firebase/analytics');
  const supported = await sdk.isSupported();
  return {
    enable() {
      if (!supported) return;
      sdk.setConsent({ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      analytics ||= sdk.getAnalytics(app);
      sdk.setAnalyticsCollectionEnabled(analytics, true);
    },
    disable() {
      if (analytics) {
        sdk.setAnalyticsCollectionEnabled(analytics, false);
        sdk.setConsent({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      }
    },
  };
});
export async function setOptionalAnalyticsConsent(allowed: boolean) {
  if (useEmulators || !firebaseConfig.measurementId) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${firebaseConfig.measurementId}`] = !allowed;
  await applyAnalyticsChoice(allowed);
}

// Initialize Firestore with better error handling
let db: Firestore;
try {
  // Try to get existing Firestore instance
  db = getFirestore(app);
} catch {
  // If that fails, try initializing with specific settings
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true, // Helps with connection issues
    });
  } catch (initError) {
    console.error('Failed to initialize Firestore:', initError);
    // Create a mock Firestore to prevent app crashes
    db = {} as Firestore;
  }
}

// Export Firebase services
export { app, analytics };
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
storage.maxUploadRetryTime = 15000;
storage.maxOperationRetryTime = 10000;
if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9098');
  connectFirestoreEmulator(db, '127.0.0.1', 8085);
  connectStorageEmulator(storage, '127.0.0.1', 9198);
}

// Set auth persistence to local (survives browser refresh)
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase auth persistence set to browserLocalPersistence');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Export db as optional - check before using
export { db };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
