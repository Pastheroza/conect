import React from 'react';
import { ActionType } from '../types';
import { Zap, Search, Box, RotateCcw, History } from 'lucide-react';

interface ActionPanelProps {
  onAction: (type: ActionType) => void;
  hasRepos: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ onAction, hasRepos }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <button
        onClick={() => onAction(ActionType.ANALYZE)}
        disabled={!hasRepos}
        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
      >
        <Search className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Analyze</span>
      </button>

      <button
        onClick={() => onAction(ActionType.INTEGRATE)}
        disabled={!hasRepos}
        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
      >
        <Zap className="w-5 h-5 text-amber-500" />
        <span className="text-sm font-medium text-gray-700">Integrate</span>
      </button>

      <button
        onClick={() => onAction(ActionType.GENERATE)}
        disabled={!hasRepos}
        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
      >
        <Box className="w-5 h-5 text-emerald-600" />
        <span className="text-sm font-medium text-gray-700">Generate</span>
      </button>

      <button
        onClick={() => onAction(ActionType.HISTORY)}
        disabled={!hasRepos}
        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
      >
        <History className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">History</span>
      </button>

      <button
        onClick={() => onAction(ActionType.RESET)}
        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2 group md:col-span-1 col-span-2 lg:col-span-1"
      >
        <RotateCcw className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
        <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Reset</span>
      </button>
    </div>
  );
};