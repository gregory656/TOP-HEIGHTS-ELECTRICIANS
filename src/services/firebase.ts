// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export { analytics };

export default app;
