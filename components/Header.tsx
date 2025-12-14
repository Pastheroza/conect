import React from 'react';
import { Network, Github, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  serverStatus: 'connecting' | 'connected' | 'error';
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ serverStatus, user, onLogin, onLogout }) => {
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
    <header className="relative mb-8 text-center pt-8">
      {/* Auth Section - Absolute Positioned Top Right */}
      <div className="absolute top-0 right-0 md:top-4 md:right-4">
        {user ? (
          <div className="flex items-center gap-3 bg-white p-1.5 pr-3 rounded-full border border-gray-200 shadow-sm transition-all hover:shadow-md">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.username} 
                className="w-8 h-8 rounded-full border border-gray-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <div className="flex flex-col text-left mr-1">
              <span className="text-[10px] text-gray-400 font-medium leading-none">Signed in as</span>
              <span className="text-xs font-semibold text-gray-700 leading-tight">@{user.username}</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
            <button 
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Github className="w-4 h-4" />
            <span>Sign in with GitHub</span>
          </button>
        )}
      </div>

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