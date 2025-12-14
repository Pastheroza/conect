import React from 'react';
import { Network } from 'lucide-react';

interface HeaderProps {
  serverStatus: 'connecting' | 'connected' | 'error';
}

export const Header: React.FC<HeaderProps> = ({ serverStatus }) => {
  const getStatusConfig = () => {
    switch (serverStatus) {
      case 'connected':
        return { 
          dotColor: 'bg-emerald-500', 
          pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          text: 'System Online' 
        };
      case 'error':
        return { 
          dotColor: 'bg-red-500', 
          pillClass: 'bg-red-50 text-red-700 border-red-200',
          text: 'System Offline' 
        };
      default:
        return { 
          dotColor: 'bg-amber-500', 
          pillClass: 'bg-amber-50 text-amber-700 border-amber-200',
          text: 'Connecting...' 
        };
    }
  };

  const config = getStatusConfig();

  return (
    <header className="mb-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="relative p-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <Network className="w-8 h-8 text-black" />
          {/* Status Dot on Icon */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${config.dotColor} animate-pulse`} />
        </div>
      </div>
      
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
        conect
      </h1>
      
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-5">
        Connect multiple Git repositories into one project
      </p>

      {/* Status Pill */}
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${config.pillClass}`}>
          <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
          {config.text}
        </div>
      </div>
    </header>
  );
};