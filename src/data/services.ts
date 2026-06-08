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
    id: 'home-solar',
    title: 'Home Solar Installation',
    shortDescription: 'Roof-mounted solar systems designed around your daily energy use and backup needs.',
    fullDescription:
      'We design and install residential solar systems that fit your roof, budget, and power habits. Every project starts with a load audit and site survey, then moves into panel sizing, inverter selection, installation, testing, and handover support.',
    image: '/solarpeople.jpg',
    keyBenefits: [
      'Custom sizing for your home appliances',
      'Clean roof mounting and cable routing',
      'Hybrid inverter options for backup power',
      'Clear handover and maintenance guidance',
    ],
  },
  {
    id: 'commercial-solar',
    title: 'Commercial Solar Systems',
    shortDescription: 'High-output solar arrays for shops, offices, schools, farms, and hospitality spaces.',
    fullDescription:
      'Our commercial solar service helps businesses reduce daytime power costs and protect margins. We plan system capacity, production expectations, installation phasing, and maintenance access so the system works in the real world.',
    image: '/solafarm.jpg',
    keyBenefits: [
      'Energy planning for business operations',
      'Scalable panel layouts',
      'Reduced grid dependence during daytime hours',
      'Professional project coordination',
    ],
  },
  {
    id: 'battery-backup',
    title: 'Solar Battery Backup',
    shortDescription: 'Battery and inverter systems that keep priority loads running when the grid goes down.',
    fullDescription:
      'We pair solar panels with dependable battery storage so essential appliances, lights, routers, fridges, and business equipment stay available. Our team recommends practical storage capacity instead of overselling unnecessary equipment.',
    image: '/leadacidbatteries.jpeg',
    keyBenefits: [
      'Backup design for priority loads',
      'Battery-ready hybrid inverter setup',
      'Expandable storage options',
      'Safer energy use during outages',
    ],
  },
  {
    id: 'solar-maintenance',
    title: 'Solar Maintenance',
    shortDescription: 'Inspection, cleaning, testing, and performance checks for existing solar systems.',
    fullDescription:
      'A solar system performs best when panels, cables, batteries, and inverters are checked regularly. We inspect system health, clean panels where needed, review production issues, and recommend practical fixes.',
    image: '/solarenergy.jpeg',
    keyBenefits: [
      'Panel and inverter health checks',
      'Performance troubleshooting',
      'Battery condition review',
      'Maintenance reports with next steps',
    ],
  },
  {
    id: 'energy-audit',
    title: 'Solar Energy Audit',
    shortDescription: 'A focused audit that turns your power bill and appliance load into a realistic solar plan.',
    fullDescription:
      'Before buying equipment, we help you understand what size solar system makes sense. The audit reviews your current consumption, appliance priorities, roof potential, backup expectations, and budget range.',
    image: '/solafarm2.jpg',
    keyBenefits: [
      'Load profile and bill review',
      'Recommended system size',
      'Budget guidance before purchase',
      'Clear installation roadmap',
    ],
  },
  {
    id: 'solar-upgrade',
    title: 'Solar System Upgrade',
    shortDescription: 'Panel, inverter, and battery upgrades for systems that need more capacity or reliability.',
    fullDescription:
      'If your current solar setup no longer meets your needs, we can assess it and recommend targeted upgrades. We focus on improving performance without replacing equipment that still has useful life.',
    image: '/3phase-solar-power.jpeg',
    keyBenefits: [
      'Capacity expansion planning',
      'Inverter and battery compatibility checks',
      'Improved reliability for growing loads',
      'Practical upgrade sequencing',
    ],
  },
];
