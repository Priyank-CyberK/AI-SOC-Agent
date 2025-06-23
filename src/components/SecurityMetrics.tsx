import React from 'react';
import { Shield, AlertTriangle, Activity, Clock, Target, TrendingUp } from 'lucide-react';
import { SecurityMetrics as MetricsType } from '../types/soc';

interface SecurityMetricsProps {
  metrics: MetricsType;
}

const SecurityMetrics: React.FC<SecurityMetricsProps> = ({ metrics }) => {
  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-cyber-green';
    if (health >= 70) return 'text-cyber-orange';
    return 'text-cyber-red';
  };

  const getHealthBg = (health: number) => {
    if (health >= 90) return 'bg-cyber-green';
    if (health >= 70) return 'bg-cyber-orange';
    return 'bg-cyber-red';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Network Health */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity size={20} className="mr-2 text-cyber-blue" />
            Network Health
          </h3>
          <span className={`text-2xl font-bold ${getHealthColor(metrics.networkHealth)}`}>
            {metrics.networkHealth.toFixed(1)}%
          </span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${getHealthBg(metrics.networkHealth)}`}
              style={{ width: `${metrics.networkHealth}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Poor</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>

      {/* Threats Detected */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <AlertTriangle size={20} className="mr-2 text-cyber-red" />
            Threats Detected
          </h3>
          <span className="text-2xl font-bold text-cyber-red">
            {metrics.threatsDetected}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          <p className="mb-1">Blocked: <span className="text-cyber-green">{metrics.threatsBlocked}</span></p>
          <p>Success Rate: <span className="text-cyber-blue">{((metrics.threatsBlocked / Math.max(metrics.threatsDetected, 1)) * 100).toFixed(1)}%</span></p>
        </div>
      </div>

      {/* AI Accuracy */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target size={20} className="mr-2 text-cyber-purple" />
            AI Accuracy
          </h3>
          <span className="text-2xl font-bold text-cyber-purple">
            {metrics.aiAccuracy.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-cyber-purple h-2 rounded-full transition-all duration-1000"
            style={{ width: `${metrics.aiAccuracy}%` }}
          ></div>
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Clock size={20} className="mr-2 text-cyber-orange" />
            Avg Response Time
          </h3>
          <span className="text-2xl font-bold text-cyber-orange">
            {metrics.averageResponseTime.toFixed(1)}s
          </span>
        </div>
        <div className="text-sm text-gray-400">
          <p>Target: &lt;5s</p>
        </div>
      </div>

      {/* Systems Compromised */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Shield size={20} className="mr-2 text-cyber-red" />
            Systems Compromised
          </h3>
          <span className="text-2xl font-bold text-cyber-red">
            {metrics.systemsCompromised}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          <p>Critical threshold: 5</p>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp size={20} className="mr-2 text-cyber-green" />
            SOC Status
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            metrics.networkHealth >= 90 
              ? 'bg-cyber-green/20 text-cyber-green' 
              : metrics.networkHealth >= 70 
                ? 'bg-cyber-orange/20 text-cyber-orange'
                : 'bg-cyber-red/20 text-cyber-red'
          }`}>
            {metrics.networkHealth >= 90 ? 'OPTIMAL' : metrics.networkHealth >= 70 ? 'ELEVATED' : 'CRITICAL'}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          <p>AI Agent: <span className="text-cyber-green">ACTIVE</span></p>
          <p>Last Updated: <span className="text-gray-300">{new Date().toLocaleTimeString()}</span></p>
        </div>
      </div>
    </div>
  );
};

export default SecurityMetrics;