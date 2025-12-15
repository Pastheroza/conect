import React, { useState } from 'react';
import { ActionType, StepStatus } from '../types';
import { Zap, Search, RotateCcw, Lock, Check, FileCode2, Puzzle, Loader2, AlertCircle, GitPullRequest, Rocket, Github } from 'lucide-react';

interface ActionPanelProps {
  onAction: (type: ActionType, payload?: any) => void;
  isReady: boolean;
  isProcessing: boolean;
  pipelineStatus: Record<string, StepStatus>;
  stepErrors?: Record<string, string | null>;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ 
  onAction, 
  isReady, 
  isProcessing,
  pipelineStatus,
  stepErrors = {}
}) => {
  const [projectName, setProjectName] = useState('');
  
  // Check if pipeline is mostly complete to unlock Apply/Publish
  const isValidationComplete = pipelineStatus[ActionType.VALIDATE] === 'success';

  return (
    <div className="mb-8">
      {/* Custom Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-error-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

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
            loadingLabel="Analyzing..."
            completedLabel="1. Analyzed"
            onClick={() => onAction(ActionType.ANALYZE)} 
            disabled={!isReady || isProcessing}
            status={pipelineStatus[ActionType.ANALYZE]}
            errorMessage={stepErrors[ActionType.ANALYZE]}
          />
          <PipelineButton 
            icon={Puzzle} 
            label="2. Match" 
            loadingLabel="Matching..."
            completedLabel="2. Matched"
            onClick={() => onAction(ActionType.MATCH)} 
            disabled={!isReady || isProcessing}
            status={pipelineStatus[ActionType.MATCH]}
            errorMessage={stepErrors[ActionType.MATCH]}
          />
          <PipelineButton 
            icon={FileCode2} 
            label="3. Generate" 
            loadingLabel="Generating..."
            completedLabel="3. Generated"
            onClick={() => onAction(ActionType.GENERATE)} 
            disabled={!isReady || isProcessing}
            status={pipelineStatus[ActionType.GENERATE]}
            errorMessage={stepErrors[ActionType.GENERATE]}
          />
          <PipelineButton 
            icon={Zap} 
            label="4. Integrate" 
            loadingLabel="Integrating..."
            completedLabel="4. Integrated"
            onClick={() => onAction(ActionType.INTEGRATE)} 
            disabled={!isReady || isProcessing}
            status={pipelineStatus[ActionType.INTEGRATE]}
            errorMessage={stepErrors[ActionType.INTEGRATE]}
          />
           <PipelineButton 
            icon={Check} 
            label="5. Validate" 
            loadingLabel="Validating..."
            completedLabel="5. Validated"
            onClick={() => onAction(ActionType.VALIDATE)} 
            disabled={!isReady || isProcessing}
            status={pipelineStatus[ActionType.VALIDATE]}
            errorMessage={stepErrors[ActionType.VALIDATE]}
          />
        </div>
      </div>

      {/* Deployment Section */}
      <div className="mb-6">
         <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pl-1">
          Deployment Strategy
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Create Pull Requests */}
          <div className={`${pipelineStatus[ActionType.APPLY] === 'error' ? 'animate-error-shake' : ''}`}>
             <button
              onClick={() => onAction(ActionType.APPLY)}
              disabled={!isValidationComplete || isProcessing}
              title={stepErrors[ActionType.APPLY] || 'Update existing repos via PRs'}
              className={`
                w-full h-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all shadow-sm
                ${isValidationComplete 
                  ? 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md text-gray-700' 
                  : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                }
              `}
            >
              <GitPullRequest className={`w-5 h-5 ${isValidationComplete ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div className="text-center">
                <div className="font-semibold text-sm">Strategy A: Fork & PR</div>
                <div className="text-[10px] text-gray-500 mt-1">Update original repositories</div>
              </div>
            </button>
          </div>

          {/* Option B: Create New Repository */}
          <div className={`p-4 rounded-xl border transition-all shadow-sm ${
             isValidationComplete 
             ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200' 
             : 'bg-gray-50 border-gray-100 opacity-60'
          }`}>
             <div className="flex items-center gap-2 mb-3">
               <Github className={`w-4 h-4 ${isValidationComplete ? 'text-indigo-600' : 'text-gray-400'}`} />
               <span className="font-semibold text-sm text-gray-700">Strategy B: New Repository</span>
             </div>
             
             <div className="space-y-3">
               <input 
                  type="text" 
                  placeholder="new-repo-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={!isValidationComplete || isProcessing}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
               />
               <button
                  onClick={() => onAction(ActionType.PUBLISH, { name: projectName })}
                  disabled={!isValidationComplete || isProcessing || !projectName.trim()}
                  className={`
                    w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all
                    ${!isValidationComplete || !projectName.trim() || isProcessing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-95'
                    }
                  `}
               >
                  {pipelineStatus[ActionType.PUBLISH] === 'loading' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Rocket className="w-3 h-3" />
                  )}
                  <span>Create & Push</span>
               </button>
             </div>
          </div>
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
  loadingLabel?: string;
  completedLabel?: string;
  onClick: () => void;
  disabled: boolean;
  status: StepStatus;
  errorMessage?: string | null;
}

const PipelineButton: React.FC<PipelineButtonProps> = ({ 
  icon: Icon, 
  label, 
  loadingLabel, 
  completedLabel, 
  onClick, 
  disabled, 
  status,
  errorMessage
}) => {
  
  // Dynamic styles based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 border-emerald-500 shadow-emerald-100';
      case 'error':
        // Red background + shake animation class
        return 'bg-red-50 border-red-400 shadow-red-100 animate-error-shake hover:bg-red-100';
      case 'loading':
        return 'bg-blue-50 border-blue-300 shadow-blue-100';
      default:
        return 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'success': return 'text-emerald-600';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const isCompleted = status === 'success';
  const isLoading = status === 'loading';
  const isError = status === 'error';

  const getLabelText = () => {
    if (isLoading) return loadingLabel || 'Processing...';
    if (isCompleted) return completedLabel || 'Completed';
    if (isError) return 'Failed';
    return label;
  };

  return (
    <button
      onClick={onClick}
      // Allow clicking on error to retry, but disable if generic disabled prop is true AND not loading/error
      disabled={disabled && !isLoading && !isError}
      title={isError && errorMessage ? `Error: ${errorMessage}` : label}
      className={`
        flex flex-col items-center justify-center p-3 
        border rounded-lg shadow-sm 
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 
        transition-all duration-300 gap-2 h-20 relative
        ${getStatusStyles()}
      `}
    >
      {isLoading ? (
        <Loader2 className={`w-5 h-5 ${getIconColor()} animate-spin`} />
      ) : isCompleted ? (
        <Check className={`w-6 h-6 ${getIconColor()}`} />
      ) : isError ? (
        <AlertCircle className={`w-5 h-5 ${getIconColor()}`} />
      ) : (
        <Icon className={`w-5 h-5 ${getIconColor()}`} />
      )}
      
      <span className={`text-[10px] font-bold uppercase tracking-tight text-center leading-tight ${getIconColor()}`}>
        {getLabelText()}
      </span>
    </button>
  );
};
