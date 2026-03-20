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
    image: '/solarenergy.jpeg',
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
    image: '/solafarm.jpg',
    keyBenefits: [
      'Reduce electricity costs by up to 80%',
      '30-year panel warranty coverage',
      'Smart grid integration capability',
      'Government rebate assistance',
      'Real-time monitoring systems',
    ],
  },
  {
    id: 'battery-storage',
    title: 'Battery Storage Solutions',
    shortDescription: 'Maximize your energy independence with our advanced battery storage systems.',
    fullDescription: 'Our Battery Storage Solutions provide a reliable way to store excess energy generated from solar panels or the grid. We offer a range of battery technologies, including lithium-ion and lead-acid systems, tailored to meet your specific energy needs. Our services include system design, installation, and integration with existing solar or electrical systems. With our battery storage solutions, you can reduce reliance on the grid, ensure backup power during outages, and take advantage of time-of-use electricity rates.',
    image: '/leadacidbatteries.jpeg',
    keyBenefits: [
      'Seamless integration with solar systems',
      '24/7 monitoring and support',
      'Customizable storage capacities',
      'Enhanced energy security and reliability',
      'Potential savings on energy bills',
    ],
  },
  {
    id: 'commercial-wiring',
    title: 'Commercial Wiring',
    shortDescription: 'Professional electrical wiring services for offices, retail spaces, restaurants, and commercial buildings.',
    fullDescription: 'Our Commercial Wiring service delivers complete electrical solutions for offices, retail spaces, restaurants, and commercial buildings of all sizes. From new construction wiring to tenant improvements and system upgrades, we handle every aspect of commercial electrical work. Our services include lighting design and installation, data and network cabling, security system integration, HVAC electrical connections, and emergency lighting systems. We pride ourselves on clean installations, minimal business disruption, and timely project completion.',
    image: '/commercialwiring.jpeg',
    keyBenefits: [
      'Minimal business disruption during installation',
      'Code-compliant installations guaranteed',
      'Scalable infrastructure for future growth',
      'Integrated lighting control systems',
      'Comprehensive project management',
    ],
  },
  {
    id: 'electrical-troubleshooting',
    title: 'Electrical Troubleshooting',
    shortDescription: 'Expert diagnosis and repair services for electrical issues in commercial settings.',
    fullDescription: 'Our Electrical Troubleshooting service specializes in diagnosing and resolving electrical problems in commercial buildings. Whether you are experiencing flickering lights, tripped breakers, or other electrical malfunctions, our team of experienced electricians is here to help. We utilize advanced diagnostic tools and techniques to quickly identify the root cause of electrical issues and implement effective solutions. Our goal is to minimize downtime and ensure the safety and reliability of your electrical systems.',
    image: '/electrical troubleshooting.jpeg',
    keyBenefits: [
      'Rapid response to electrical emergencies',
      'Thorough diagnostics and testing',
      'Expert repairs by licensed electricians',
      'Preventative maintenance recommendations',
      'Compliance with all safety standards',
    ],
  },
  {
    id: 'home-automation',
    title: 'Home Automation',
    shortDescription: 'Transform your home into a smart living space with our intelligent automation solutions.',
    fullDescription: 'Experience the future of living with our Home Automation solutions. We specialize in creating intelligent homes that seamlessly integrate lighting, climate control, security systems, entertainment, and appliances into a unified, easy-to-control ecosystem. Our services include smart lighting installation, automated thermostat setup, security camera and alarm integration, voice-controlled systems, and whole-home networking. Control everything from your smartphone or tablet, and enjoy enhanced comfort, security, and energy efficiency.',
    image: '/homeautomation.jpeg',
    keyBenefits: [
      'Increased energy efficiency through automation',
      'Enhanced security with smart monitoring',
      'Convenient control from anywhere',
      'Customizable settings for individual preferences',
      'Professional installation and ongoing support',
    ],
  },

  {
    id: '3phase-solar-power',
    title: '3-Phase Solar Power',
    shortDescription: 'Efficient and reliable solar power solutions for commercial and industrial applications.',
    fullDescription: 'Our 3-Phase Solar Power service is designed for businesses looking to harness the sun\'s energy for their power needs. We provide comprehensive solar panel installation, maintenance, and monitoring services tailored to the unique requirements of commercial and industrial clients. Our team of experts will work with you to design a solar power system that maximizes energy production and savings while ensuring compliance with all regulations and standards.',
    image: '/3phase solar power.jpeg',
    keyBenefits: [
      'Voice and app-based control systems',
      'Enhanced home security integration',
      'Energy savings through smart scheduling',
      'Scalable from single room to whole home',
      'Professional installation and support',
    ],
  },
  {
    id: '6KW Solar Power',
    title: '6KW Solar Power',
    shortDescription: 'High-efficiency solar power systems for residential and commercial use.',
    fullDescription: 'Our 6KW Solar Power service offers a robust solution for those looking to invest in solar energy. This system is ideal for medium to large-sized homes and businesses, providing ample power to meet your energy needs while reducing your carbon footprint. We handle everything from initial consultation and site assessment to installation and maintenance, ensuring a seamless transition to solar energy.',
    image: '/6kw solar power.jpeg',
    keyBenefits: [
      'Significant reduction in energy bills',
      'Environmentally friendly energy source',
      'Increased property value',
      'Low maintenance requirements',
      'Expert installation and support',
    ],
  },

  {
    id: 'commercial-wiring',
    title: 'Commercial Wiring',
    shortDescription: 'Professional electrical wiring services for offices, retail spaces, restaurants, and commercial buildings.',
    fullDescription: 'Our Commercial Wiring service delivers complete electrical solutions for offices, retail spaces, restaurants, and commercial buildings of all sizes. From new construction wiring to tenant improvements and system upgrades, we handle every aspect of commercial electrical work. Our services include lighting design and installation, data and network cabling, security system integration, HVAC electrical connections, and emergency lighting systems. We pride ourselves on clean installations, minimal business disruption, and timely project completion.',
    image: '/commercialwiring.jpeg',
    keyBenefits: [
      'Minimal business disruption during installation',
      'Code-compliant installations guaranteed',
      'Scalable infrastructure for future growth',
      'Integrated lighting control systems',
      'Comprehensive project management',
    ],
  },
  {
    id: 'emergency-repairs',
    title: 'Emergency Electrical Repairs',
    shortDescription: 'Rapid response electrical repair services available around the clock for urgent electrical issues.',
    fullDescription: 'Electrical emergencies can happen at any time, which is why our Emergency Electrical Repair service is available 24/7, 365 days a year. Our rapid response team is equipped to handle any electrical emergency, from power outages and faulty wiring to electrical fires and equipment failures. We prioritize safety and swift resolution, arriving fully stocked with the tools and parts needed to restore your electrical systems quickly. Don\'t risk property damage or personal injury - call us immediately for expert emergency electrical services.',
    image: '/emergencyrepairs.jpeg',
    keyBenefits: [
      '30-minute average response time',
      '24/7 availability including holidays',
      'Fully licensed and insured electricians',
      'Upfront pricing before work begins',
      'Temporary power solutions when needed',
    ],
  },
];

