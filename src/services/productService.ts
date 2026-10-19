import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db, firebaseAuthConfigured } from './firebase';
import type { Product } from '../data/products';
import { products as localProducts } from '../data/products';

export function normalizeProduct(id: string, data: Record<string, unknown>): Product {
  return { ...data, id, name: String(data.name || ''), price: Number(data.price || 0), category: String(data.category || ''),
    image: String(data.image || ''), inStock: data.active === true && Number(data.stock) > 0 } as Product;
}
const publicCatalogue = () => query(collection(db, 'products'), where('published', '==', true));
const fallbackCatalogue = (): Product[] => localProducts.map(product => ({ ...product, inStock: undefined }));
export const fetchProducts = async () => {
  if (!firebaseAuthConfigured) return fallbackCatalogue();
  const remote = (await getDocs(publicCatalogue())).docs.map(d => normalizeProduct(d.id, d.data()));
  return remote.length ? remote : fallbackCatalogue();
};
export function subscribeProducts(callback: (products: Product[]) => void, error: (error: Error) => void, admin = false) {
  if (!firebaseAuthConfigured && !admin) {
    callback(fallbackCatalogue());
    return () => {};
  }
  try {
    return onSnapshot(admin ? collection(db, 'products') : publicCatalogue(), snapshot => {
      const remote = snapshot.docs.map(d => normalizeProduct(d.id, d.data()));
      if (remote.length || admin) callback(remote);
      else {
        callback(fallbackCatalogue());
      }
    }, reason => {
      if (!admin) callback(fallbackCatalogue());
      else error(reason);
    });
  } catch (reason) {
    if (!admin) callback(fallbackCatalogue());
    else error(reason instanceof Error ? reason : new Error('Products could not be loaded.'));
    return () => {};
  }
}
