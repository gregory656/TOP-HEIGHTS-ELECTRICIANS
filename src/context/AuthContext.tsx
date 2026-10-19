// src/context/AuthContext.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
  const [authError, setAuthError] = useState('');

  const authErrorMessage = useCallback((error: unknown, action: 'login' | 'signup' | 'google') => {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    if (code === 'auth/invalid-email') return 'Enter a valid email address.';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'That email and password do not match. Check them or create an account.';
    if (code === 'auth/email-already-in-use') return 'An account already uses this email. Sign in instead, or use password reset.';
    if (code === 'auth/weak-password') return 'Choose a password with at least 6 characters.';
    if (code === 'auth/operation-not-allowed') return 'This sign-in method is temporarily unavailable. Try another method or contact support.';
    if (code === 'auth/unauthorized-domain') return 'Sign-in is not available from this address. Please contact support.';
    if (code === 'auth/network-request-failed') return 'Could not connect. Check your internet connection and try again.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Wait a little, then try again.';
    if (code === 'auth/popup-closed-by-user') return 'Google sign-in was cancelled.';
    return action === 'signup' ? 'Could not create your account right now. Please try again.' : action === 'google' ? 'Google sign-in failed. Please try again or use email and password.' : 'Could not sign in. Check your details and try again.';
  }, []);

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
    setAuthError('');
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setLoginModalOpen(false);
      return true;
    } catch (error: unknown) {
      console.error('Login error:', error);
      setAuthError(authErrorMessage(error, 'login'));
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
    setAuthError('');
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      
      setLoginModalOpen(false);
      return true;
    } catch (error: unknown) {
      console.error('Google login error:', error);
      setAuthError(authErrorMessage(error, 'google'));
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

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError('');
    if (!email.trim()) { setAuthError('Enter your email address first, then request a password reset.'); return false; }
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(authErrorMessage(error, 'login'));
      return false;
    } finally { setIsLoading(false); }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setAuthError('');
    try {
      setIsLoading(true);
      console.log('Starting signup process...');
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth:', result.user.uid);
      const newUser: User = {
        uid: result.user.uid,
        role: 'customer',
        name: getDisplayName(result.user, name),
        email: result.user.email || email,
        photoURL: result.user.photoURL || undefined,
      };
      setFirebaseUser(result.user);
      setUser(newUser);
      setStoredUsername(newUser.name);

      // Firebase Auth has already created the account. A profile write can fail
      // independently (for example, if Firestore is temporarily unavailable),
      // so do not tell the user that account creation failed in that case.
      try {
        const userData = await upsertUserDocument(result.user, name);
        setStoredUsername(userData.name);
        setUser(userData);
        console.log('User profile saved to Firestore');
      } catch (profileError) {
        console.error('Account created, but saving the Firestore profile failed:', profileError);
      }

      setLoginModalOpen(false);
      return true;
    } catch (error: unknown) {
      console.error('Signup error:', error);
      setAuthError(authErrorMessage(error, 'signup'));
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
        resetPassword,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
        authLoading,
        authError,
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
