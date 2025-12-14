import React from 'react';
import { ActionType } from '../types';
import { Zap, Search, RotateCcw, Lock, CheckCircle2, FileCode2, Puzzle, ArrowRight } from 'lucide-react';

interface ActionPanelProps {
  onAction: (type: ActionType) => void;
  isReady: boolean;
  isProcessing?: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ onAction, isReady, isProcessing = false }) => {
  return (
    <div className="mb-8">
      {!isReady && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-xs font-medium">
          <Lock className="w-3 h-3" />
          <span>Requirement: Add at least 2 repositories to enable actions.</span>
        </div>
      )}

      {/* Hero Section: Auto Pilot */}
      <div className="mb-6">
        <button
          onClick={() => onAction(ActionType.RUN_ALL)}
          disabled={!isReady || isProcessing}
          className="w-full relative overflow-hidden group p-5 bg-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="relative z-10 flex flex-col items-center justify-center gap-2">
            <div className="p-2 bg-white/10 rounded-full">
              <Zap className={`w-6 h-6 text-yellow-300 ${isProcessing ? 'animate-pulse' : ''}`} />
            </div>
            <h3 className="text-lg font-bold tracking-tight">Run Auto-Pilot</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Analyze • Match • Generate • Integrate
            </p>
          </div>
          {/* Decorative background gradient */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </button>
      </div>
      
      {/* Manual Pipeline Steps */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pl-1">
          Manual Pipeline
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <PipelineButton 
            icon={Search} 
            label="1. Analyze" 
            onClick={() => onAction(ActionType.ANALYZE)} 
            disabled={!isReady || isProcessing}
            colorClass="text-blue-600"
          />
          <PipelineButton 
            icon={Puzzle} 
            label="2. Match" 
            onClick={() => onAction(ActionType.MATCH)} 
            disabled={!isReady || isProcessing}
            colorClass="text-purple-600"
          />
          <PipelineButton 
            icon={FileCode2} 
            label="3. Generate" 
            onClick={() => onAction(ActionType.GENERATE)} 
            disabled={!isReady || isProcessing}
            colorClass="text-indigo-600"
          />
          <PipelineButton 
            icon={Zap} 
            label="4. Integrate" 
            onClick={() => onAction(ActionType.INTEGRATE)} 
            disabled={!isReady || isProcessing}
            colorClass="text-amber-500"
          />
           <PipelineButton 
            icon={CheckCircle2} 
            label="5. Validate" 
            onClick={() => onAction(ActionType.VALIDATE)} 
            disabled={!isReady || isProcessing}
            colorClass="text-emerald-600"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-gray-100 pt-4 flex justify-end">
        <button
          onClick={() => onAction(ActionType.RESET)}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Project
        </button>
      </div>
    </div>
  );
};

// Helper Component for consistency
interface PipelineButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled: boolean;
  colorClass: string;
}

const PipelineButton: React.FC<PipelineButtonProps> = ({ icon: Icon, label, onClick, disabled, colorClass }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all gap-2 h-20"
  >
    <Icon className={`w-5 h-5 ${colorClass}`} />
    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{label}</span>
  </button>
);
