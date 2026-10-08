export type LeakageStatus = 'Normal' | 'Possible Leakage';

export type IncidentStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface MonitoringZone {
  id: string;
  name: string;
  location: string;
  flowRate: number; // in Liters per minute (L/min)
  normalThresholdMax: number;
  status: LeakageStatus;
  lastUpdated: string;
  description: string;
}

export interface Incident {
  id: string | number;
  zoneId?: string;
  location: string;
  flowRate: number; // L/min at detection
  detectionTime: string;
  status: IncidentStatus;
  severity?: 'Critical' | 'Warning' | 'Moderate';
  notes?: string;
  acknowledgementTime?: string;
  resolutionTime?: string;
  acknowledgedTime?: string;
  resolvedTime?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface BackendFlowReading {
  location: string;
  flowRate: number;
  status: 'Normal' | 'Possible Leakage';
  leakage: boolean;
  timestamp: string;
}

export interface UserSession {
  username: string;
  name: string;
  role: string;
}
