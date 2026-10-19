import type { BlogPost } from '../services/contentService';

// Helpful starter content keeps Insights useful when the live Firestore feed is
// unavailable or has not been populated yet.
export const starterGuides: BlogPost[] = [
  {
    id: 'starter-inverter-guide', title: 'Choosing an inverter for your home', slug: 'choosing-an-inverter',
    excerpt: 'Start with the appliances you need to run, their starting loads and the way you plan to use solar.',
    summary: 'An inverter should be selected as part of a complete system design, not by headline wattage alone.',
    content: `Begin with a list of the appliances you want to power at the same time. Note each appliance's running power and whether it has a motor or compressor that may need extra power when starting. A fridge, pump or air conditioner can have a higher starting demand than its normal running demand.\n\nNext, decide whether the system will work with solar panels, batteries, the grid, or a combination. Check the inverter's continuous output, surge rating, battery voltage and solar input limits against the equipment in the proposed system.\n\nAsk for the complete equipment schedule and a compatibility check before buying. Wiring, protection devices, earthing and installation should be assessed by a qualified professional for the site and applicable requirements.`,
    author: 'Top Heights Solar', category: 'Inverters', tags: ['inverter', 'home solar', 'system design'], mediaType: 'image', image: '/solarenergy.jpeg', videoUrl: '', embedUrl: '', status: 'published', publishedDate: '2026-10-19', seoTitle: '', seoDescription: '',
  },
  {
    id: 'starter-battery-guide', title: 'Battery backup: estimate what you need', slug: 'battery-backup-basics',
    excerpt: 'A simple way to think about backup is to list the loads, their power draw and how long you need them to run.',
    summary: 'Usable battery energy depends on the battery, inverter, settings, temperature and system design.',
    content: `Write down the appliances that must stay on during an outage and the number of hours you want them to run. A rough energy estimate is the sum of each appliance's power in watts multiplied by the hours it runs, divided by 1,000. The result is watt-hours converted to kilowatt-hours.\n\nFor example, a 100-watt load running for 5 hours uses about 0.5 kWh before system losses. This calculation is only a planning aid: appliances cycle on and off, motors can draw extra power when starting, and a battery's nameplate capacity is not always the same as its usable energy.\n\nAsk your installer to check usable capacity, inverter limits, battery chemistry, backup circuits and charging settings together. Never change battery wiring or protection equipment without a qualified professional.`,
    author: 'Top Heights Solar', category: 'Batteries', tags: ['battery', 'backup', 'energy'], mediaType: 'image', image: '/leadacidbatteries.jpeg', videoUrl: '', embedUrl: '', status: 'published', publishedDate: '2026-10-19', seoTitle: '', seoDescription: '',
  },
  {
    id: 'starter-site-assessment', title: 'What to expect from a solar site assessment', slug: 'solar-site-assessment',
    excerpt: 'A good assessment looks beyond roof space to shade, energy use, electrical safety and the way the property operates.',
    summary: 'A site visit helps turn an initial idea into a design based on the actual property and its loads.',
    content: `Before a visit, gather a recent electricity bill and a list of the appliances or business equipment you want to power. Think about the times of day you use the most energy and what should keep running during an outage.\n\nThe assessment may consider roof or ground-mount options, shade through the day, cable routes, equipment location, existing electrical installation, earthing and protection. For a farm or business, operating schedules, pumps and three-phase loads may affect the design.\n\nAsk for the proposed panel layout, inverter and battery specifications, assumptions behind any savings estimate, installation scope and maintenance guidance. Final system sizing and pricing should follow the professional assessment, not a generic online estimate.`,
    author: 'Top Heights Solar', category: 'Planning', tags: ['site assessment', 'solar planning', 'safety'], mediaType: 'image', image: '/solarpeople.jpg', videoUrl: '', embedUrl: '', status: 'published', publishedDate: '2026-10-19', seoTitle: '', seoDescription: '',
  },
];
