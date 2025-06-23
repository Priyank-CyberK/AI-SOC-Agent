import React from 'react';
import { Shield, Brain, Activity } from 'lucide-react';
import { useSOCData } from './hooks/useSOCData';
import NetworkTopology from './components/NetworkTopology';
import ThreatMonitor from './components/ThreatMonitor';
import AIDecisionPanel from './components/AIDecisionPanel';
import SecurityMetrics from './components/SecurityMetrics';
import AttackSimulator from './components/AttackSimulator';

function App() {
  const {
    networkNodes,
    threats,
    aiDecisions,
    metrics,
    isSimulating,
    startSimulation,
    stopSimulation,
    simulateAttack
  } = useSOCData();

  const activeThreats = threats.filter(t => t.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield size={32} className="text-cyber-green" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI-Powered SOC Agent</h1>
                <p className="text-sm text-gray-400">Autonomous Security Operations Center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Brain size={20} className="text-cyber-purple" />
                <span className="text-sm text-gray-300">AI Agent Status:</span>
                <span className="text-sm font-medium text-cyber-green">ACTIVE</span>
              </div>
              
              {activeThreats > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-cyber-red/20 border border-cyber-red/50 rounded-full">
                  <Activity size={16} className="text-cyber-red animate-pulse" />
                  <span className="text-sm font-medium text-cyber-red">
                    {activeThreats} Active Threat{activeThreats !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Security Metrics Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Security Overview</h2>
          <SecurityMetrics metrics={metrics} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Network Topology */}
          <NetworkTopology nodes={networkNodes} />
          
          {/* Attack Simulator */}
          <AttackSimulator
            isSimulating={isSimulating}
            onStartSimulation={startSimulation}
            onStopSimulation={stopSimulation}
            onSimulateAttack={simulateAttack}
          />
        </div>

        {/* Threat Monitoring and AI Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Threat Monitor */}
          <ThreatMonitor threats={threats} />
          
          {/* AI Decision Panel */}
          <AIDecisionPanel decisions={aiDecisions} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>© 2025 AI-Powered SOC Agent</span>
              <span>•</span>
              <span>Reinforcement Learning + LLM Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;