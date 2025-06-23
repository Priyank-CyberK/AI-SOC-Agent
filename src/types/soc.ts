export interface NetworkNode {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'router' | 'firewall' | 'database';
  status: 'secure' | 'warning' | 'compromised' | 'offline';
  ip: string;
  connections: string[];
  x: number;
  y: number;
}

export interface ThreatAlert {
  id: string;
  timestamp: Date;
  type: 'malware' | 'ddos' | 'intrusion' | 'data_breach' | 'port_scan' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  status: 'active' | 'investigating' | 'mitigated' | 'resolved';
  aiConfidence: number;
}

export interface AIDecision {
  id: string;
  timestamp: Date;
  threat: string;
  decision: string;
  reasoning: string;
  actions: string[];
  confidence: number;
  outcome: 'pending' | 'success' | 'failed';
}

export interface SecurityMetrics {
  threatsDetected: number;
  threatsBlocked: number;
  systemsCompromised: number;
  averageResponseTime: number;
  aiAccuracy: number;
  networkHealth: number;
}