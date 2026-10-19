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
import { syncUserProfile } from '../services/userProfile';
import { setStoredUsername } from '../utils/courseStorage';
import { auth, googleProvider, db, authPersistenceReady } from '../services/firebase';

import { AuthContext, type User } from './AuthContextData';

// Re-export AuthContext for useAuth hook
export { AuthContext };

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

  const upsertUserDocument = useCallback((fbUser: FirebaseUser, fallbackName?: string) =>
    syncUserProfile(db, fbUser, 'customer', fallbackName), []);

  useEffect(() => {
    let active = true;
    let authVersion = 0;
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
        const version = ++authVersion;
        setAuthLoading(true);
        try {
          if (fbUser) {
            const baseUser: User = {
              uid: fbUser.uid,
              role: 'customer',
              name: getDisplayName(fbUser),
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
            };

            setFirebaseUser(fbUser);
            setUser(baseUser);

            const userData = await upsertUserDocument(fbUser);
            if (!active || version !== authVersion) return;
            setStoredUsername(userData.name);
            setUser(userData);
          } else {
            setFirebaseUser(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error resolving auth user:', error);
          if (!active || version !== authVersion) return;
          if (fbUser) {
            setUser({
              uid: fbUser.uid,
              role: 'customer',
              name: getDisplayName(fbUser),
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
            });
          }
        } finally {
          if (active && version === authVersion) {
            setAuthLoading(false);
            setIsLoading(false);
          }
        }
      });
    };

    void init();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [upsertUserDocument, getDisplayName]);

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
      await signInWithPopup(auth, googleProvider);
      
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
