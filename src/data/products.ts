// src/data/products.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  inStock?: boolean;
  description?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Industrial Voltage Regulator 5000VA',
    price: 18500,
    category: 'Power Protection',
    image: 'https://picsum.photos/400/300?electric&random=1',
    inStock: true,
    description: 'Heavy-duty voltage regulator for industrial applications. Protects your equipment from voltage fluctuations.',
  },
  {
    id: 2,
    name: 'Gold-Plated Circuit Breaker 63A',
    price: 2400,
    category: 'Circuit Protection',
    image: 'https://picsum.photos/400/300?electric&random=2',
    inStock: true,
    description: 'Premium gold-plated circuit breaker for enhanced conductivity and corrosion resistance.',
  },
  {
    id: 3,
    name: 'Smart Home Electrical Panel',
    price: 45000,
    category: 'Smart Home',
    image: 'https://picsum.photos/400/300?electric&random=3',
    inStock: true,
    description: 'WiFi-enabled smart panel with energy monitoring and remote control capabilities.',
  },
  {
    id: 4,
    name: 'Commercial LED High Bay Light 200W',
    price: 12800,
    category: 'Lighting',
    image: 'https://picsum.photos/400/300?electric&random=4',
    inStock: true,
    description: 'High-efficiency LED high bay light for warehouses and commercial spaces.',
  },
  {
    id: 5,
    name: 'Three-Phase Motor Starter',
    price: 8900,
    category: 'Motors',
    image: 'https://picsum.photos/400/300?electric&random=5',
    inStock: true,
    description: 'Professional motor starter with overload protection for industrial motors.',
  },
  {
    id: 6,
    name: 'Solar Inverter 5KVA Hybrid',
    price: 125000,
    category: 'Renewable Energy',
    image: 'https://picsum.photos/400/300?electric&random=6',
    inStock: true,
    description: 'Hybrid solar inverter with battery charging and grid-tie capabilities.',
  },
  {
    id: 7,
    name: 'PVC Conduit Pipe 25mm (3m)',
    price: 380,
    category: 'Wiring Accessories',
    image: 'https://picsum.photos/400/300?electric&random=7',
    inStock: true,
    description: 'High-quality PVC conduit for electrical wiring installation.',
  },
  {
    id: 8,
    name: 'Premium Electrical Socket Outlet',
    price: 850,
    category: 'Switches & Sockets',
    image: 'https://picsum.photos/400/300?electric&random=8',
    inStock: true,
    description: 'Modern designed socket outlet with USB charging ports.',
  },
  {
    id: 9,
    name: 'Industrial Cable 2.5mm² (100m Roll)',
    price: 6500,
    category: 'Cables',
    image: 'https://picsum.photos/400/300?electric&random=9',
    inStock: true,
    description: 'Copper conductor PVC insulated cable for indoor electrical installations.',
  },
  {
    id: 10,
    name: 'Emergency Exit Light LED',
    price: 3200,
    category: 'Safety Equipment',
    image: 'https://picsum.photos/400/300?electric&random=10',
    inStock: true,
    description: 'Battery-backed emergency exit light with long-lasting LEDs.',
  },
  {
    id: 11,
    name: 'Air Conditioner Circuit Breaker 32A',
    price: 1850,
    category: 'Circuit Protection',
    image: 'https://picsum.photos/400/300?electric&random=11',
    inStock: true,
    description: 'Specialized circuit breaker for air conditioning units.',
  },
  {
    id: 12,
    name: 'LED Street Light 150W',
    price: 15800,
    category: 'Lighting',
    image: 'https://picsum.photos/400/300?electric&random=12',
    inStock: true,
    description: 'High lumen LED street light with photocell sensor for automatic on/off.',
  },
];

export const categories = [
  'All',
  'Power Protection',
  'Circuit Protection',
  'Smart Home',
  'Lighting',
  'Motors',
  'Renewable Energy',
  'Wiring Accessories',
  'Switches & Sockets',
  'Cables',
  'Safety Equipment',
];
