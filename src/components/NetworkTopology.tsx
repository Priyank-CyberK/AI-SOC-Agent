import React from 'react';
import { Server, HardDrive, Shield, Router, Monitor, Database } from 'lucide-react';
import { NetworkNode } from '../types/soc';

interface NetworkTopologyProps {
  nodes: NetworkNode[];
}

const NetworkTopology: React.FC<NetworkTopologyProps> = ({ nodes }) => {
  const getNodeIcon = (type: NetworkNode['type']) => {
    switch (type) {
      case 'server': return Server;
      case 'database': return Database;
      case 'firewall': return Shield;
      case 'router': return Router;
      case 'workstation': return Monitor;
      default: return Server;
    }
  };

  const getStatusColor = (status: NetworkNode['status']) => {
    switch (status) {
      case 'secure': return 'text-cyber-green border-cyber-green';
      case 'warning': return 'text-cyber-orange border-cyber-orange';
      case 'compromised': return 'text-cyber-red border-cyber-red';
      case 'offline': return 'text-gray-500 border-gray-500';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusAnimation = (status: NetworkNode['status']) => {
    switch (status) {
      case 'warning': return 'animate-pulse';
      case 'compromised': return 'animate-ping-slow';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <div className="w-2 h-2 bg-cyber-green rounded-full mr-2 animate-pulse"></div>
        Network Topology
      </h3>
      
      <div className="relative h-96 bg-gray-800/30 rounded-lg overflow-hidden">
        <svg className="absolute inset-0 w-full h-full">
          {/* Draw connections */}
          {nodes.map(node => 
            node.connections.map(connectedId => {
              const connectedNode = nodes.find(n => n.id === connectedId);
              if (!connectedNode) return null;
              
              return (
                <line
                  key={`${node.id}-${connectedId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={connectedNode.x}
                  y2={connectedNode.y}
                  stroke="rgba(75, 85, 99, 0.5)"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              );
            })
          )}
        </svg>

        {/* Render nodes */}
        {nodes.map(node => {
          const Icon = getNodeIcon(node.type);
          return (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getStatusAnimation(node.status)}`}
              style={{ left: node.x, top: node.y }}
            >
              <div className={`w-12 h-12 rounded-full border-2 ${getStatusColor(node.status)} bg-gray-800/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110`}>
                <Icon size={20} />
              </div>
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs text-center">
                <div className="text-white font-medium">{node.name}</div>
                <div className="text-gray-400">{node.ip}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-cyber-green rounded-full mr-2"></div>
          <span className="text-gray-300">Secure</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-cyber-orange rounded-full mr-2"></div>
          <span className="text-gray-300">Warning</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-cyber-red rounded-full mr-2"></div>
          <span className="text-gray-300">Compromised</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
          <span className="text-gray-300">Offline</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;