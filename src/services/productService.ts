import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '../data/products';

export function normalizeProduct(id: string, data: Record<string, unknown>): Product {
  return { ...data, id, name: String(data.name || ''), price: Number(data.price || 0), category: String(data.category || ''),
    image: String(data.image || ''), inStock: data.active === true && Number(data.stock) > 0 } as Product;
}
const publicCatalogue = () => query(collection(db, 'products'), where('published', '==', true));
export const fetchProducts = async () => (await getDocs(publicCatalogue())).docs.map(d => normalizeProduct(d.id, d.data()));
export function subscribeProducts(callback: (products: Product[]) => void, error: (error: Error) => void, admin = false) {
  return onSnapshot(admin ? collection(db, 'products') : publicCatalogue(), snapshot => callback(snapshot.docs.map(d => normalizeProduct(d.id, d.data()))), error);
}
