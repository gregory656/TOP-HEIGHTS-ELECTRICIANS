// src/services/productService.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { products as hardcodedProducts } from '../data/products';

// A simple in-memory cache to avoid re-fetching from Firestore on every call
let firestoreProductsCache: unknown[] | null = null;

export const fetchProducts = async () => {
  // If we have a cached version of Firestore products, return it
  if (firestoreProductsCache) {
    return firestoreProductsCache;
  }

  try {
    // Try to fetch from Firestore
    const querySnapshot = await getDocs(collection(db, 'products'));
    if (!querySnapshot.empty) {
      const productsFromFirestore = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Cache the result
      firestoreProductsCache = productsFromFirestore;
      console.log('Fetched products from Firestore');
      return productsFromFirestore;
    } else {
      // If Firestore is empty, fall back to hardcoded data
      console.log('Firestore is empty or unavailable, falling back to hardcoded products.');
      return hardcodedProducts;
    }
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    // On error, fall back to hardcoded data
    return hardcodedProducts;
  }
};
