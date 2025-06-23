import React from 'react';
import { Brain, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AIDecision } from '../types/soc';

interface AIDecisionPanelProps {
  decisions: AIDecision[];
}

const AIDecisionPanel: React.FC<AIDecisionPanelProps> = ({ decisions }) => {
  const getOutcomeIcon = (outcome: AIDecision['outcome']) => {
    switch (outcome) {
      case 'success': return <CheckCircle size={16} className="text-cyber-green" />;
      case 'failed': return <XCircle size={16} className="text-cyber-red" />;
      case 'pending': return <Clock size={16} className="text-cyber-orange animate-pulse" />;
      default: return <Clock size={16} />;
    }
  };

  const getOutcomeColor = (outcome: AIDecision['outcome']) => {
    switch (outcome) {
      case 'success': return 'border-cyber-green/30 bg-cyber-green/10';
      case 'failed': return 'border-cyber-red/30 bg-cyber-red/10';
      case 'pending': return 'border-cyber-orange/30 bg-cyber-orange/10';
      default: return 'border-gray-600 bg-gray-800/30';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Brain size={20} className="mr-2 text-cyber-purple" />
        AI Decision Engine
        <div className="ml-2 flex items-center">
          <div className="w-2 h-2 bg-cyber-purple rounded-full animate-pulse"></div>
          <span className="ml-1 text-xs text-cyber-purple">ACTIVE</span>
        </div>
      </h3>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {decisions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Brain size={48} className="mx-auto mb-2 opacity-50" />
            <p>AI Agent Standby</p>
            <p className="text-sm">Ready to respond to threats</p>
          </div>
        ) : (
          decisions.map(decision => (
            <div
              key={decision.id}
              className={`p-4 border rounded-lg transition-all duration-300 ${getOutcomeColor(decision.outcome)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getOutcomeIcon(decision.outcome)}
                  <span className="text-white font-medium">AI Decision</span>
                </div>
                <span className="text-xs text-gray-400">
                  {decision.timestamp.toLocaleTimeString()}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-cyber-blue text-sm font-medium mb-1">Decision:</p>
                <p className="text-white text-sm">{decision.decision}</p>
              </div>

              <div className="mb-3">
                <p className="text-cyber-orange text-sm font-medium mb-1">Reasoning:</p>
                <p className="text-gray-300 text-sm">{decision.reasoning}</p>
              </div>

              <div className="mb-3">
                <p className="text-cyber-green text-sm font-medium mb-1">Actions Taken:</p>
                <div className="flex flex-wrap gap-1">
                  {decision.actions.map((action, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Confidence: {decision.confidence.toFixed(1)}%
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-cyber-purple h-1 rounded-full transition-all duration-500"
                      style={{ width: `${decision.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIDecisionPanel;