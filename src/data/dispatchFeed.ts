export type DispatchEntry = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: 'residential' | 'commercial' | 'maintenance';
  status: 'In Progress' | 'QA Passed' | 'Scheduled' | 'Field Completed';
  timestamp: string;
  technician: string;
  badge: string;
};

export const dispatchFeed: DispatchEntry[] = [
  {
    id: 'df-01',
    title: 'Transformer & Surge Retrofit',
    description:
      'Replaced failing transformer, beefed up surge protection, and tied in the new rooftop solar inverter banks before re-balancing three residential feeders.',
    location: 'Westlands, Nairobi',
    category: 'residential',
    status: 'Field Completed',
    timestamp: 'Mar 18, 2026 · 08:45',
    technician: 'Njeri Mwangi',
    badge: 'Reliability Upgrade',
  },
  {
    id: 'df-02',
    title: 'High-bay Lighting Switch-over',
    description:
      'Commercial hangar lighting upgrade with adaptive sensors, 0-10V dimming, and solar PV-friendly power management tied to the service rooftop.',
    location: 'Embakasi Industrial Park',
    category: 'commercial',
    status: 'QA Passed',
    timestamp: 'Mar 19, 2026 · 13:30',
    technician: 'James Korir',
    badge: 'Controls Specialist',
  },
  {
    id: 'df-03',
    title: 'Smart Home Baseline',
    description:
      'Wire, smart panel, EV-ready port, and solar array prep for a south-Nairobi residence; includes app-based control nodes.',
    location: 'Karen, Nairobi',
    category: 'residential',
    status: 'In Progress',
    timestamp: 'Mar 19, 2026 · 10:12',
    technician: 'Zuri Hassan',
    badge: 'Luxury Residential',
  },
  {
    id: 'df-04',
    title: 'Hospital Backup Power Audit',
    description:
      'Maintenance sweep for generator, UPS, ATS, and solar microgrid tie-in to keep ICU circuits mission-critical.',
    location: 'Kenyatta Hospital',
    category: 'maintenance',
    status: 'Scheduled',
    timestamp: 'Mar 20, 2026 · 06:00',
    technician: 'Dr. Ouma & Team',
    badge: 'Critical Infrastructure',
  },
  {
    id: 'df-05',
    title: 'Data Center Rack Refresh',
    description:
      'Re-routed PDUs, installed power monitoring, and verified redundancy while enabling the client’s solar-backed UPS bank.',
    location: 'Westlands · Server Farm',
    category: 'commercial',
    status: 'Field Completed',
    timestamp: 'Mar 17, 2026 · 17:45',
    technician: 'Moses Mutugi',
    badge: 'Enterprise-Grade',
  },
  {
    id: 'df-06',
    title: 'Maintenance Sprint · Condo Cluster',
    description:
      'Emergency week of condo lobbies, stairwells, EV chargers, and solar carport drivers to replace failing hardware.',
    location: 'Riverside Condominiums',
    category: 'maintenance',
    status: 'QA Passed',
    timestamp: 'Mar 18, 2026 · 16:20',
    technician: 'Team Lumen',
    badge: 'Rapid Response',
  },
];

export const dispatchCategories = [
  { label: 'All', value: 'all' },
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Maintenance', value: 'maintenance' },
];
