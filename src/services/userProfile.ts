import type { User as FirebaseUser } from 'firebase/auth';
import { doc, runTransaction, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { User, UserRole } from '../context/AuthContextData';

// Existing roles are managed separately from sign-in profile updates.
export async function syncUserProfile(
  database: Firestore,
  account: FirebaseUser,
  _initialRole: UserRole,
  fallbackName?: string,
): Promise<User> {
  const reference = doc(database, 'users', account.uid);
  return runTransaction(database, async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.exists() ? snapshot.data() : null;
    const name = fallbackName?.trim() || existing?.name || account.displayName?.trim()
      || account.email?.split('@')[0] || 'User';
    const role = existing?.role === 'admin' ? 'admin' : 'customer';
    transaction.set(reference, {
      uid: account.uid,
      name,
      email: account.email || '',
      photoURL: account.photoURL || null,
      updatedAt: serverTimestamp(),
      ...(existing ? {} : { role, createdAt: serverTimestamp() }),
    }, { merge: true });
    return { uid: account.uid, role, name, email: account.email || '', photoURL: account.photoURL || undefined };
  });
}
