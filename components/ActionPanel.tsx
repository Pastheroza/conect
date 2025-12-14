import React from 'react';
import { ActionType } from '../types';
import { Zap, Search, RotateCcw, Lock, Lightbulb } from 'lucide-react';

interface ActionPanelProps {
  onAction: (type: ActionType) => void;
  isReady: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ onAction, isReady }) => {
  return (
    <div className="mb-8">
      {!isReady && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-xs font-medium">
          <Lock className="w-3 h-3" />
          <span>Requirement: Add at least 2 repositories to enable actions.</span>
        </div>
      )}
      
      {/* Grid updated for 4 items: 2x2 on mobile, 4x1 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onAction(ActionType.ANALYZE)}
          disabled={!isReady}
          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
        >
          <Search className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Analyze</span>
        </button>

        <button
          onClick={() => onAction(ActionType.INTEGRATE)}
          disabled={!isReady}
          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
        >
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">Integrate</span>
        </button>

        <button
          onClick={() => onAction(ActionType.SUGGESTIONS)}
          disabled={!isReady}
          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
        >
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Suggestions</span>
        </button>

        <button
          onClick={() => onAction(ActionType.RESET)}
          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all gap-2 group"
        >
          <RotateCcw className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Reset Project</span>
        </button>
      </div>
    </div>
  );
};