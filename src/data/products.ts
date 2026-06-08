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
    name: 'Mono Solar Panel 550W',
    price: 18500,
    category: 'Solar Panels',
    image: '/solarenergy.jpeg',
    inStock: true,
    description: 'High-efficiency mono photovoltaic panel for homes, shops, and commercial rooftops.',
  },
  {
    id: 2,
    name: 'Roof Solar Installation Package',
    price: 85000,
    category: 'Solar Packages',
    image: '/solarpeople.jpg',
    inStock: true,
    description: 'Survey, mounting hardware, professional installation, and commissioning for a clean rooftop solar setup.',
  },
  {
    id: 3,
    name: '3-Phase Solar Power System',
    price: 245000,
    category: 'Solar Packages',
    image: '/3phase-solar-power.jpeg',
    inStock: true,
    description: 'Commercial solar package designed for businesses that need reliable daytime production and expansion room.',
  },
  {
    id: 4,
    name: '6kW Hybrid Solar System',
    price: 380000,
    category: 'Solar Packages',
    image: '/6kw-solar-power.jpeg',
    inStock: true,
    description: 'Complete hybrid solar setup for larger homes and small businesses with backup-ready energy needs.',
  },
  {
    id: 5,
    name: 'Pure Sine Solar Inverter',
    price: 45000,
    category: 'Renewable Energy',
    image: '/solarenergy.jpeg',
    inStock: true,
    description: 'Reliable inverter for converting solar energy into stable power for everyday appliances and equipment.',
  },
  {
    id: 6,
    name: 'Deep Cycle Solar Battery',
    price: 15000,
    category: 'Solar Storage',
    image: '/leadacidbatteries.jpeg',
    inStock: true,
    description: 'Storage battery for backup power, night use, and hybrid solar systems.',
  },
  {
    id: 7,
    name: 'Solar Battery Cable Kit',
    price: 500,
    category: 'Solar Accessories',
    image: '/solar-battery-cables.jpeg',
    inStock: true,
    description: 'Durable cable kit for safe solar panel, inverter, and battery connections.',
  },
  {
    id: 8,
    name: 'Solar Farm Consultation',
    price: 25000,
    category: 'Solar Packages',
    image: '/solafarm2.jpg',
    inStock: true,
    description: 'Technical consultation for larger solar sites, load planning, and staged deployment.',
  },
];

export const categories = [
  'All',
  'Solar Panels',
  'Solar Packages',
  'Solar Storage',
  'Solar Accessories',
  'Renewable Energy',
];
