import { createContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';

// User role type
export type UserRole = 'admin' | 'customer';

// User data type
export interface User {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  photoURL?: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  authLoading: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

// Create the context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
