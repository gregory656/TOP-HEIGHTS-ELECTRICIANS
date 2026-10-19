export interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image: string;
  inStock?: boolean;
  description?: string;
  details?: string;
  specifications?: { label: string; value: string }[];
  buyingAdvice?: string;
  slug?: string;
  sku?: string;
  images?: string[];
  stock?: number;
  lowStockThreshold?: number;
  status?: 'active' | 'draft' | 'out_of_stock' | 'archived';
  published?: boolean;
  featured?: boolean;
  comparisonPrice?: number | null;
  version?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
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
    details: 'A 550W monocrystalline panel for a rooftop solar installation. Discuss your available roof space and daily electricity use with our team to plan the number of panels and the rest of your system.',
    specifications: [{ label: 'Rated power', value: '550W' }, { label: 'Panel technology', value: 'Monocrystalline' }, { label: 'Applications', value: 'Homes, shops and commercial rooftops' }],
    buyingAdvice: 'Confirm the panel dimensions, inverter compatibility, mounting requirements and manufacturer warranty before ordering.',
  },
  {
    id: 2,
    name: 'Roof Solar Installation Package',
    price: 85000,
    category: 'Solar Packages',
    image: '/solarpeople.jpg',
    inStock: true,
    description: 'Survey, mounting hardware, professional installation, and commissioning for a clean rooftop solar setup.',
    details: 'An installation package covering a site survey, mounting hardware, installation and commissioning. The site survey helps establish roof suitability and the installation scope for your property.',
    specifications: [{ label: 'Service', value: 'Rooftop solar installation' }, { label: 'Listed scope', value: 'Survey, mounting hardware, installation and commissioning' }],
    buyingAdvice: 'Confirm the final scope and whether panels, an inverter, batteries and any additional electrical work are included in your quotation.',
  },
  {
    id: 3,
    name: '3-Phase Solar Power System',
    price: 245000,
    category: 'Solar Packages',
    image: '/3phase-solar-power.jpeg',
    inStock: true,
    description: 'Commercial solar package designed for businesses that need reliable daytime production and expansion room.',
    details: 'A three-phase solar package for commercial energy needs. Share your business operating hours and equipment loads so the team can discuss daytime generation and future expansion requirements.',
    specifications: [{ label: 'System type', value: 'Three-phase solar' }, { label: 'Application', value: 'Commercial premises' }],
    buyingAdvice: 'Confirm the system capacity, included equipment, battery options and installation scope against your site requirements.',
  },
  {
    id: 4,
    name: '6kW Hybrid Solar System',
    price: 380000,
    category: 'Solar Packages',
    image: '/6kw-solar-power.jpeg',
    inStock: true,
    description: 'Complete hybrid solar setup for larger homes and small businesses with backup-ready energy needs.',
    details: 'A 6kW hybrid solar setup for larger homes and small businesses. Planning starts with the appliances you want to power and the backup duration you need.',
    specifications: [{ label: 'System rating', value: '6kW' }, { label: 'System type', value: 'Hybrid solar' }, { label: 'Applications', value: 'Larger homes and small businesses' }],
    buyingAdvice: 'Ask for the equipment list, usable battery capacity, expected backup duration for your loads and installation requirements.',
  },
  {
    id: 5,
    name: 'Pure Sine Solar Inverter',
    price: 45000,
    category: 'Renewable Energy',
    image: '/solarenergy.jpeg',
    inStock: true,
    description: 'Reliable inverter for converting solar energy into stable power for everyday appliances and equipment.',
    details: 'A pure sine wave inverter for a solar power system. Inverter selection depends on both the running power and starting loads of the appliances you want to use.',
    specifications: [{ label: 'Product type', value: 'Solar inverter' }, { label: 'Waveform', value: 'Pure sine wave' }],
    buyingAdvice: 'Confirm the rated output, surge capacity, battery voltage and solar input limits before choosing this inverter.',
  },
  {
    id: 6,
    name: 'Deep Cycle Solar Battery',
    price: 15000,
    category: 'Solar Storage',
    image: '/leadacidbatteries.jpeg',
    inStock: true,
    description: 'Storage battery for backup power, night use, and hybrid solar systems.',
    details: 'A deep cycle battery for storing energy for use at night or during power interruptions. The required storage depends on your appliances and how long you need them to run.',
    specifications: [{ label: 'Product type', value: 'Deep cycle solar battery' }, { label: 'Applications', value: 'Backup power, night use and hybrid solar systems' }],
    buyingAdvice: 'Confirm the battery chemistry, voltage, capacity, compatible charging settings and warranty before ordering.',
  },
  {
    id: 7,
    name: 'Solar Battery Cable Kit',
    price: 500,
    category: 'Solar Accessories',
    image: '/solar-battery-cables.jpeg',
    inStock: true,
    description: 'Durable cable kit for safe solar panel, inverter, and battery connections.',
    details: 'A cable kit for solar system connections. Cable selection should match the connection type, current and distance between your equipment.',
    specifications: [{ label: 'Product type', value: 'Solar battery cable kit' }, { label: 'Application', value: 'Solar system connections' }],
    buyingAdvice: 'Confirm the cable lengths, conductor size, connector types and kit contents with your installer before ordering.',
  },
  {
    id: 8,
    name: 'Solar Farm Consultation',
    price: 25000,
    category: 'Solar Packages',
    image: '/solafarm2.jpg',
    inStock: true,
    description: 'Technical consultation for larger solar sites, load planning, and staged deployment.',
    details: 'A technical consultation for planning a larger solar site. Discuss your electricity demand, available site area and rollout priorities with the team.',
    specifications: [{ label: 'Service', value: 'Solar farm consultation' }, { label: 'Planning areas', value: 'Site requirements, electrical loads and staged deployment' }],
    buyingAdvice: 'Confirm the consultation format, site visit arrangements and deliverables before booking.',
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
