// src/services/firebase.ts
import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Firebase configuration for Top Heights Electricals
const firebaseConfig = {
  apiKey: "AIzaSyCR8x-_bNRhWyi9UDirotO3TQijHxYZp_Y",
  authDomain: "top-heights-electricals.firebaseapp.com",
  projectId: "top-heights-electricals",
  storageBucket: "top-heights-electricals.firebasestorage.app",
  messagingSenderId: "408995603252",
  appId: "1:408995603252:web:5ae5222e3d061470ce7b61",
  measurementId: "G-SQ2RCSD1VY"
};

// Initialize Firebase app
let app: FirebaseApp;
try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}

// Initialize Analytics (optional - won't break if not available)
let analytics: Analytics | undefined;
try {
  analytics = getAnalytics(app);
} catch {
  console.warn('Firebase Analytics not available');
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
