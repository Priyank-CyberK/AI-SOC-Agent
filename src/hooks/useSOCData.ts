import { useState, useEffect, useRef } from 'react';
import { NetworkNode, ThreatAlert, AIDecision, SecurityMetrics } from '../types/soc';

export const useSOCData = () => {
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [aiDecisions, setAIDecisions] = useState<AIDecision[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatsDetected: 0,
    threatsBlocked: 0,
    systemsCompromised: 0,
    averageResponseTime: 0,
    aiAccuracy: 98.5,
    networkHealth: 95
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize network topology
  useEffect(() => {
    const initialNodes: NetworkNode[] = [
      { id: '1', name: 'Web Server', type: 'server', status: 'secure', ip: '192.168.1.10', connections: ['2', '3'], x: 200, y: 100 },
      { id: '2', name: 'Database', type: 'database', status: 'secure', ip: '192.168.1.20', connections: ['1', '4'], x: 400, y: 200 },
      { id: '3', name: 'Firewall', type: 'firewall', status: 'secure', ip: '192.168.1.1', connections: ['1', '5'], x: 100, y: 200 },
      { id: '4', name: 'Domain Controller', type: 'server', status: 'secure', ip: '192.168.1.30', connections: ['2', '6'], x: 500, y: 100 },
      { id: '5', name: 'Router', type: 'router', status: 'secure', ip: '192.168.1.254', connections: ['3', '6'], x: 150, y: 300 },
      { id: '6', name: 'Workstation-01', type: 'workstation', status: 'secure', ip: '192.168.1.100', connections: ['4', '5'], x: 350, y: 300 },
    ];
    setNetworkNodes(initialNodes);
  }, []);

  const generateThreat = (): ThreatAlert => {
    const types: ThreatAlert['type'][] = ['malware', 'ddos', 'intrusion', 'data_breach', 'port_scan', 'anomaly'];
    const severities: ThreatAlert['severity'][] = ['low', 'medium', 'high', 'critical'];
    const nodes = networkNodes.map(n => n.name);
    
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const source = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const target = nodes[Math.floor(Math.random() * nodes.length)];

    const descriptions = {
      malware: `Suspicious executable detected on ${target}`,
      ddos: `High volume traffic detected targeting ${target}`,
      intrusion: `Unauthorized access attempt detected on ${target}`,
      data_breach: `Potential data exfiltration from ${target}`,
      port_scan: `Port scanning activity detected from ${source}`,
      anomaly: `Unusual network behavior detected on ${target}`
    };

    return {
      id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      severity,
      source,
      target,
      description: descriptions[type],
      status: 'active',
      aiConfidence: Math.random() * 40 + 60 // 60-100%
    };
  };

  const generateAIDecision = (threat: ThreatAlert): AIDecision => {
    const decisions = {
      malware: 'Isolate affected system and initiate malware scan',
      ddos: 'Enable DDoS protection and rate limiting',
      intrusion: 'Block source IP and increase monitoring',
      data_breach: 'Initiate incident response protocol',
      port_scan: 'Add source to watchlist and monitor',
      anomaly: 'Increase monitoring and collect additional data'
    };

    const actions = {
      malware: ['Quarantine system', 'Run full scan', 'Update signatures'],
      ddos: ['Enable rate limiting', 'Scale infrastructure', 'Block source IPs'],
      intrusion: ['Block IP address', 'Reset compromised accounts', 'Enable 2FA'],
      data_breach: ['Isolate systems', 'Notify stakeholders', 'Preserve evidence'],
      port_scan: ['Log activity', 'Monitor source', 'Update firewall rules'],
      anomaly: ['Collect logs', 'Analyze patterns', 'Alert security team']
    };

    return {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      threat: threat.id,
      decision: decisions[threat.type],
      reasoning: `Based on threat pattern analysis and ML model confidence of ${threat.aiConfidence.toFixed(1)}%`,
      actions: actions[threat.type],
      confidence: threat.aiConfidence,
      outcome: Math.random() > 0.1 ? 'success' : 'pending'
    };
  };

  const startSimulation = () => {
    setIsSimulating(true);
    intervalRef.current = setInterval(() => {
      // Generate new threat occasionally
      if (Math.random() < 0.3) {
        const newThreat = generateThreat();
        setThreats(prev => [newThreat, ...prev.slice(0, 19)]); // Keep last 20 threats
        
        // Generate AI decision for the threat
        const decision = generateAIDecision(newThreat);
        setAIDecisions(prev => [decision, ...prev.slice(0, 19)]);

        // Update node status based on threat
        setNetworkNodes(prev => prev.map(node => {
          if (node.name === newThreat.target) {
            return {
              ...node,
              status: newThreat.severity === 'critical' ? 'compromised' : 
                     newThreat.severity === 'high' ? 'warning' : node.status
            };
          }
          return node;
        }));

        // Update metrics
        setMetrics(prev => ({
          ...prev,
          threatsDetected: prev.threatsDetected + 1,
          threatsBlocked: decision.outcome === 'success' ? prev.threatsBlocked + 1 : prev.threatsBlocked,
          systemsCompromised: newThreat.severity === 'critical' ? prev.systemsCompromised + 1 : prev.systemsCompromised,
          averageResponseTime: Math.random() * 5 + 1,
          networkHealth: Math.max(70, prev.networkHealth - (newThreat.severity === 'critical' ? 5 : 2))
        }));
      }

      // Occasionally resolve threats
      setThreats(prev => prev.map(threat => {
        if (threat.status === 'active' && Math.random() < 0.2) {
          return { ...threat, status: 'resolved' };
        }
        return threat;
      }));

      // Restore node health gradually
      setNetworkNodes(prev => prev.map(node => {
        if (node.status === 'warning' && Math.random() < 0.3) {
          return { ...node, status: 'secure' };
        }
        return node;
      }));

      // Improve network health gradually
      setMetrics(prev => ({
        ...prev,
        networkHealth: Math.min(100, prev.networkHealth + 0.5)
      }));

    }, 2000); // Update every 2 seconds
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const simulateAttack = (attackType: ThreatAlert['type']) => {
    const customThreat: ThreatAlert = {
      ...generateThreat(),
      type: attackType,
      severity: 'high',
      status: 'active'
    };
    
    setThreats(prev => [customThreat, ...prev.slice(0, 19)]);
    
    const decision = generateAIDecision(customThreat);
    setAIDecisions(prev => [decision, ...prev.slice(0, 19)]);

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      threatsDetected: prev.threatsDetected + 1,
      networkHealth: Math.max(60, prev.networkHealth - 10)
    }));
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    networkNodes,
    threats,
    aiDecisions,
    metrics,
    isSimulating,
    startSimulation,
    stopSimulation,
    simulateAttack
  };
};