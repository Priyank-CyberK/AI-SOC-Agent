import React from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle } from 'lucide-react';
import { ThreatAlert } from '../types/soc';

interface ThreatMonitorProps {
  threats: ThreatAlert[];
}

const ThreatMonitor: React.FC<ThreatMonitorProps> = ({ threats }) => {
  const getSeverityColor = (severity: ThreatAlert['severity']) => {
    switch (severity) {
      case 'low': return 'text-cyber-blue border-cyber-blue';
      case 'medium': return 'text-cyber-orange border-cyber-orange';
      case 'high': return 'text-cyber-red border-cyber-red';
      case 'critical': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: ThreatAlert['status']) => {
    switch (status) {
      case 'active': return <AlertTriangle size={16} className="text-cyber-red animate-pulse" />;
      case 'investigating': return <Clock size={16} className="text-cyber-orange" />;
      case 'mitigated': return <Shield size={16} className="text-cyber-blue" />;
      case 'resolved': return <CheckCircle size={16} className="text-cyber-green" />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getTypeColor = (type: ThreatAlert['type']) => {
    switch (type) {
      case 'malware': return 'bg-red-500/20 text-red-300';
      case 'ddos': return 'bg-orange-500/20 text-orange-300';
      case 'intrusion': return 'bg-purple-500/20 text-purple-300';
      case 'data_breach': return 'bg-pink-500/20 text-pink-300';
      case 'port_scan': return 'bg-yellow-500/20 text-yellow-300';
      case 'anomaly': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <AlertTriangle size={20} className="mr-2 text-cyber-red" />
        Threat Monitor
        {threats.filter(t => t.status === 'active').length > 0 && (
          <span className="ml-2 px-2 py-1 bg-cyber-red/20 text-cyber-red text-xs rounded-full">
            {threats.filter(t => t.status === 'active').length} Active
          </span>
        )}
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {threats.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Shield size={48} className="mx-auto mb-2 opacity-50" />
            <p>No threats detected</p>
            <p className="text-sm">All systems secure</p>
          </div>
        ) : (
          threats.map(threat => (
            <div
              key={threat.id}
              className={`p-4 border rounded-lg bg-gray-800/30 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/50 ${getSeverityColor(threat.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(threat.status)}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(threat.type)}`}>
                    {threat.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {threat.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-white text-sm mb-2">{threat.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Source: {threat.source}</span>
                <span>Target: {threat.target}</span>
                <span>Confidence: {threat.aiConfidence.toFixed(1)}%</span>
              </div>
              
              <div className="mt-2 bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-cyber-green h-1 rounded-full transition-all duration-500"
                  style={{ width: `${threat.aiConfidence}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThreatMonitor;