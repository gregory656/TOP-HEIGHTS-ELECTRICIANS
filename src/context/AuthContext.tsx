// src/context/AuthContext.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

import { AuthContext, type User } from './AuthContextData';

// Re-export AuthContext for useAuth hook
export { AuthContext };

// Admin email - change this to your admin email
const ADMIN_EMAIL = 'admin@topheights.co.ke';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Function to fetch or create user document
  const fetchOrCreateUser = useCallback(async (fbUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: fbUser.uid,
        role: userData.role || 'customer',
        name: userData.name || fbUser.displayName || 'User',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || undefined,
      };
    } else {
      // Create new user document if doesn't exist
      const isAdmin = fbUser.email === ADMIN_EMAIL;
      const newUser: User = {
        uid: fbUser.uid,
        role: isAdmin ? 'admin' : 'customer',
        name: fbUser.displayName || 'User',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || undefined,
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', fbUser.uid), {
        uid: fbUser.uid,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        photoURL: newUser.photoURL,
        createdAt: new Date(),
      });
      
      return newUser;
    }
  }, []);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setAuthLoading(true);
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        try {
          const userData = await fetchOrCreateUser(fbUser);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Still set user with basic info from Firebase
          setUser({
            uid: fbUser.uid,
            role: 'customer',
            name: fbUser.displayName || 'User',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || undefined,
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      
      setAuthLoading(false);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchOrCreateUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setLoginModalOpen(false);
      return true;
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        const firebaseError = error as { code?: string };
        console.log('Firebase error code:', firebaseError.code);
        console.log('Firebase error message:', error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if this is the admin
      if (result.user.email === ADMIN_EMAIL) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          role: 'admin',
          name: result.user.displayName || 'Admin',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
          updatedAt: new Date(),
        }, { merge: true });
      }
      
      setLoginModalOpen(false);
      return true;
    } catch (error: unknown) {
      console.error('Google login error:', error);
      if (error instanceof Error) {
        const firebaseError = error as { code?: string };
        console.log('Firebase error code:', firebaseError.code);
        console.log('Firebase error message:', error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Starting signup process...');
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth:', result.user.uid);
      
      // Determine role based on email
      const isAdmin = email === ADMIN_EMAIL;
      
      // Save user to Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        role: isAdmin ? 'admin' : 'customer',
        name: name,
        email: email,
        createdAt: new Date(),
      });
      
      console.log('User saved to Firestore');
      setLoginModalOpen(false);
      return true;
    } catch (error: unknown) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        const firebaseError = error as { code?: string };
        const errorCode = firebaseError.code;
        const errorMessage = error.message;
        console.log('Firebase error code:', errorCode);
        console.log('Firebase error message:', errorMessage);
        
        // Log specific Firebase auth errors
        if (errorCode === 'auth/email-already-in-use') {
          console.log('User already exists');
        } else if (errorCode === 'auth/weak-password') {
          console.log('Password is too weak');
        } else if (errorCode === 'auth/invalid-email') {
          console.log('Invalid email format');
        }
      }
      return false;
    } finally {
      console.log('Signup process completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        login,
        loginWithGoogle,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
        authLoading,
        loginModalOpen,
        setLoginModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook is now exported from src/hooks/useAuth.ts
// Import it from '../hooks/useAuth' instead
