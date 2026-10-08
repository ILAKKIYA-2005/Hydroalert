import { Incident, MonitoringZone } from '../types';

export const LEAKAGE_THRESHOLD = 8.0; // in L/min

export const SIMULATION_SAMPLE_VALUES = [2.5, 3.0, 3.5, 5.0, 8.5, 9.5];

export const initialZones: MonitoringZone[] = [
  {
    id: 'zone-a',
    name: 'Block A – Main Distribution',
    location: 'Block A - 1st Floor',
    flowRate: 3.0,
    normalThresholdMax: LEAKAGE_THRESHOLD,
    status: 'Normal',
    lastUpdated: 'Just now',
    description: '1st Floor restrooms and laboratory supply pipeline.',
  },
  {
    id: 'zone-b',
    name: 'Block B – Classroom & Offices',
    location: 'Block B - 2nd Floor',
    flowRate: 8.5,
    normalThresholdMax: LEAKAGE_THRESHOLD,
    status: 'Possible Leakage',
    lastUpdated: 'Just now',
    description: '2nd Floor riser line feeding department offices and corridor taps.',
  },
  {
    id: 'zone-c',
    name: 'Block C – Administrative Wing',
    location: 'Block C - Ground Floor',
    flowRate: 2.5,
    normalThresholdMax: LEAKAGE_THRESHOLD,
    status: 'Normal',
    lastUpdated: 'Just now',
    description: 'Ground Floor main inlet and utility facilities.',
  },
];

export const initialActiveIncidents: Incident[] = [
  {
    id: 'INC-2026-001',
    zoneId: 'zone-b',
    location: 'Block B - 2nd Floor',
    flowRate: 8.5,
    detectionTime: '9:18 PM',
    status: 'ACTIVE',
    severity: 'Critical',
    notes: 'Flow rate (8.5 L/min) breached nominal 8.0 L/min leakage threshold.',
  },
];

export const initialHistoryIncidents: Incident[] = [
  {
    id: 'INC-2026-000',
    location: 'Block A - 1st Floor',
    flowRate: 9.5,
    detectionTime: '4:30 PM',
    status: 'RESOLVED',
    severity: 'Critical',
    acknowledgedTime: '4:33 PM',
    resolvedTime: '5:15 PM',
    acknowledgedAt: '4:33 PM',
    resolvedAt: '5:15 PM',
    notes: 'Joint seal repaired on 1st Floor pipe. Flow stabilized to 3.0 L/min.',
  },
];
