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
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, authPersistenceReady } from '../services/firebase';

import { AuthContext, type User } from './AuthContextData';

// Re-export AuthContext for useAuth hook
export { AuthContext };

// Admin email - change this to your admin email
const ADMIN_EMAIL = 'kamaugatehi@gmail.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const getDisplayName = useCallback((fbUser: FirebaseUser, fallbackName?: string) => {
    if (fallbackName?.trim()) return fallbackName.trim();
    if (fbUser.displayName?.trim()) return fbUser.displayName.trim();
    if (fbUser.email) return fbUser.email.split('@')[0];
    return 'User';
  }, []);

  const upsertUserDocument = useCallback(async (fbUser: FirebaseUser, fallbackName?: string) => {
    const isAdmin = fbUser.email === ADMIN_EMAIL;
    const userDocRef = doc(db, 'users', fbUser.uid);
    const name = getDisplayName(fbUser, fallbackName);

    await setDoc(
      userDocRef,
      {
        uid: fbUser.uid,
        role: isAdmin ? 'admin' : 'customer',
        name,
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || null,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, [getDisplayName]);

  // Function to fetch user and ensure user document exists
  const fetchOrCreateUser = useCallback(async (fbUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const isAdmin = fbUser.email === ADMIN_EMAIL;
    let userData: { role?: string; name?: string; email?: string; photoURL?: string } | null = null;

    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        userData = userDoc.data() as { role?: string; name?: string; email?: string; photoURL?: string };
      }
    } catch (error) {
      console.warn('Could not read user document, will attempt upsert:', error);
    }

    try {
      await upsertUserDocument(fbUser, userData?.name);
    } catch (error) {
      console.error('Failed to upsert user document:', error);
    }

    return {
      uid: fbUser.uid,
      role: userData?.role === 'admin' || isAdmin ? 'admin' : 'customer',
      name: userData?.name || getDisplayName(fbUser),
      email: fbUser.email || userData?.email || '',
      photoURL: fbUser.photoURL || userData?.photoURL || undefined,
    };
  }, [getDisplayName, upsertUserDocument]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        await authPersistenceReady;
      } catch {
        // Continue even if persistence setup fails; auth can still function.
      }

      if (!active) return;

      // Listen to Firebase auth state changes
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          if (fbUser) {
            const baseUser: User = {
              uid: fbUser.uid,
              role: fbUser.email === ADMIN_EMAIL ? 'admin' : 'customer',
              name: getDisplayName(fbUser),
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
            };

            setFirebaseUser(fbUser);
            setUser(baseUser);

            const userData = await fetchOrCreateUser(fbUser);
            setUser(userData);
          } else {
            setFirebaseUser(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error resolving auth user:', error);
          if (fbUser) {
            setUser({
              uid: fbUser.uid,
              role: fbUser.email === ADMIN_EMAIL ? 'admin' : 'customer',
              name: getDisplayName(fbUser),
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
            });
          }
        } finally {
          setAuthLoading(false);
          setIsLoading(false);
        }
      });
    };

    void init();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [fetchOrCreateUser, getDisplayName]);

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
      await upsertUserDocument(result.user);
      
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
      await upsertUserDocument(result.user, name);
      
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
