// Services data structure for Top Heights Electricians

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  keyBenefits: string[];
  videoPlaceholder?: string;
}

export const services: Service[] = [
  {
    id: 'industrial-power',
    title: 'Industrial Power Systems',
    shortDescription: 'Comprehensive electrical solutions for factories, manufacturing plants, and large-scale industrial facilities.',
    fullDescription: 'Our Industrial Power Systems service provides complete electrical infrastructure design, installation, and maintenance for factories, manufacturing plants, and large-scale industrial facilities. We specialize in high-voltage systems, motor control centers, power distribution units, and robust electrical panels designed to handle heavy loads and ensure uninterrupted operations. Our team of certified electricians works closely with your engineering staff to deliver safe, efficient, and scalable power solutions that meet all industry standards and regulations.',
    image: 'public/solarenergy.jpeg',
    keyBenefits: [
      'High-capacity power distribution up to 1000V',
      '24/7 emergency repair services',
      'Energy-efficient system design',
      'Full compliance with industrial safety standards',
      'Predictive maintenance programs',
    ],
  },
  {
    id: 'solar-energy',
    title: 'Solar Energy Solutions',
    shortDescription: 'Harness the power of the sun with our cutting-edge solar panel installation and integration services.',
    fullDescription: 'Transform your energy consumption with our comprehensive Solar Energy Solutions. We design and install state-of-the-art photovoltaic systems for residential, commercial, and industrial clients. Our services include site assessment, system design, permitting assistance, professional installation, and ongoing maintenance. Whether you\'re looking to reduce your carbon footprint, lower electricity costs, or achieve energy independence, our expert team will tailor a solar solution that meets your specific needs and budget.',
    image: 'public/solarenergy.jpeg',
    keyBenefits: [
      'Reduce electricity costs by up to 80%',
      '30-year panel warranty coverage',
      'Smart grid integration capability',
      'Government rebate assistance',
      'Real-time monitoring systems',
    ],
  },
  {
    id: 'commercial-wiring',
    title: 'Commercial Wiring',
    shortDescription: 'Professional electrical wiring services for offices, retail spaces, restaurants, and commercial buildings.',
    fullDescription: 'Our Commercial Wiring service delivers complete electrical solutions for offices, retail spaces, restaurants, and commercial buildings of all sizes. From new construction wiring to tenant improvements and system upgrades, we handle every aspect of commercial electrical work. Our services include lighting design and installation, data and network cabling, security system integration, HVAC electrical connections, and emergency lighting systems. We pride ourselves on clean installations, minimal business disruption, and timely project completion.',
    image: 'public/commercialwiring.jpeg',
    keyBenefits: [
      'Minimal business disruption during installation',
      'Code-compliant installations guaranteed',
      'Scalable infrastructure for future growth',
      'Integrated lighting control systems',
      'Comprehensive project management',
    ],
  },
  {
    id: 'home-automation',
    title: 'Home Automation',
    shortDescription: 'Transform your home into a smart living space with our intelligent automation solutions.',
    fullDescription: 'Experience the future of living with our Home Automation solutions. We specialize in creating intelligent homes that seamlessly integrate lighting, climate control, security systems, entertainment, and appliances into a unified, easy-to-control ecosystem. Our services include smart lighting installation, automated thermostat setup, security camera and alarm integration, voice-controlled systems, and whole-home networking. Control everything from your smartphone or tablet, and enjoy enhanced comfort, security, and energy efficiency.',
    image: 'public/homeautomation.jpeg',
    keyBenefits: [
      'Voice and app-based control systems',
      'Enhanced home security integration',
      'Energy savings through smart scheduling',
      'Scalable from single room to whole home',
      'Professional installation and support',
    ],
  },
  {
    id: 'emergency-repairs',
    title: 'Emergency Electrical Repairs',
    shortDescription: 'Rapid response electrical repair services available around the clock for urgent electrical issues.',
    fullDescription: 'Electrical emergencies can happen at any time, which is why our Emergency Electrical Repair service is available 24/7, 365 days a year. Our rapid response team is equipped to handle any electrical emergency, from power outages and faulty wiring to electrical fires and equipment failures. We prioritize safety and swift resolution, arriving fully stocked with the tools and parts needed to restore your electrical systems quickly. Don\'t risk property damage or personal injury—call us immediately for expert emergency electrical services.',
    image: 'public/emergencyrepairs.jpeg',
    keyBenefits: [
      '30-minute average response time',
      '24/7 availability including holidays',
      'Fully licensed and insured electricians',
      'Upfront pricing before work begins',
      'Temporary power solutions when needed',
    ],
  },
];
