import { useEffect, useState } from 'react';
import type { Product } from '../data/products';
import { subscribeProducts } from '../services/productService';

export function useProducts() {
  const [state, setState] = useState<{ products: Product[]; loading: boolean; error: string }>({ products: [], loading: true, error: '' });
  useEffect(() => subscribeProducts(products => setState({ products, loading: false, error: '' }), () => setState({ products: [], loading: false, error: 'Products could not be loaded. Please reload or contact the shop.' })), []);
  return state;
}
