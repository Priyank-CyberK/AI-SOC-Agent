import React from 'react';
import { Zap, Play, Square, Wifi, Database, Lock, Search, AlertTriangle, Bug } from 'lucide-react';
import { ThreatAlert } from '../types/soc';

interface AttackSimulatorProps {
  isSimulating: boolean;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onSimulateAttack: (type: ThreatAlert['type']) => void;
}

const AttackSimulator: React.FC<AttackSimulatorProps> = ({
  isSimulating,
  onStartSimulation,
  onStopSimulation,
  onSimulateAttack
}) => {
  const attackTypes = [
    { type: 'malware' as const, icon: Bug, name: 'Malware', description: 'Simulate malware infection' },
    { type: 'ddos' as const, icon: Wifi, name: 'DDoS Attack', description: 'Simulate distributed denial of service' },
    { type: 'intrusion' as const, icon: Lock, name: 'Intrusion', description: 'Simulate unauthorized access' },
    { type: 'data_breach' as const, icon: Database, name: 'Data Breach', description: 'Simulate data exfiltration' },
    { type: 'port_scan' as const, icon: Search, name: 'Port Scan', description: 'Simulate network reconnaissance' },
    { type: 'anomaly' as const, icon: AlertTriangle, name: 'Anomaly', description: 'Simulate unusual behavior' },
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Zap size={20} className="mr-2 text-cyber-orange" />
        Attack Simulator
        {isSimulating && (
          <div className="ml-2 flex items-center">
            <div className="w-2 h-2 bg-cyber-orange rounded-full animate-pulse"></div>
            <span className="ml-1 text-xs text-cyber-orange">RUNNING</span>
          </div>
        )}
      </h3>

      {/* Simulation Controls */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={onStartSimulation}
            disabled={isSimulating}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isSimulating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-cyber-green/20 text-cyber-green border border-cyber-green hover:bg-cyber-green hover:text-black'
            }`}
          >
            <Play size={16} className="mr-2" />
            Start Simulation
          </button>
          
          <button
            onClick={onStopSimulation}
            disabled={!isSimulating}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              !isSimulating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-cyber-red/20 text-cyber-red border border-cyber-red hover:bg-cyber-red hover:text-white'
            }`}
          >
            <Square size={16} className="mr-2" />
            Stop Simulation
          </button>
        </div>
        
        <p className="text-sm text-gray-400">
          {isSimulating 
            ? 'Simulation running - AI agent will automatically detect and respond to threats'
            : 'Start simulation to enable automatic threat generation and AI responses'
          }
        </p>
      </div>

      {/* Manual Attack Triggers */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Manual Attack Simulation</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attackTypes.map(attack => {
            const Icon = attack.icon;
            return (
              <button
                key={attack.type}
                onClick={() => onSimulateAttack(attack.type)}
                className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-cyber-orange hover:bg-gray-800/80 transition-all duration-200 text-left group"
              >
                <div className="flex items-start">
                  <Icon size={20} className="text-cyber-orange mr-3 mt-0.5 group-hover:text-white transition-colors" />
                  <div>
                    <h5 className="text-white font-medium group-hover:text-cyber-orange transition-colors">
                      {attack.name}
                    </h5>
                    <p className="text-xs text-gray-400 mt-1">
                      {attack.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 p-3 bg-cyber-orange/10 border border-cyber-orange/30 rounded-lg">
        <p className="text-xs text-cyber-orange">
          <strong>Note:</strong> This is a simulation environment. All attacks are synthetic and designed to test the AI agent's response capabilities.
        </p>
      </div>
    </div>
  );
};

export default AttackSimulator;