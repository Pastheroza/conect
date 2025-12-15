import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { RepoInput } from './components/RepoInput';
import { RepoList } from './components/RepoList';
import { ActionPanel } from './components/ActionPanel';
import { LogPanel } from './components/LogPanel';
import { Repository, LogEntry, ActionType, User, StepStatus } from './types';
import { api } from './api';

// Simple ID generator fallback
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serverStatus, setServerStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [user, setUser] = useState<User | null>(null);
  
  // Track global processing state (for disabling everything)
  const [isProcessing, setIsProcessing] = useState(false);

  // Track individual step status for visual feedback (Green buttons)
  const [pipelineStatus, setPipelineStatus] = useState<Record<string, StepStatus>>({
    [ActionType.ANALYZE]: 'idle',
    [ActionType.MATCH]: 'idle',
    [ActionType.GENERATE]: 'idle',
    [ActionType.INTEGRATE]: 'idle',
    [ActionType.VALIDATE]: 'idle',
    [ActionType.APPLY]: 'idle',
  });

  // Derived state to check requirements: Just need 2 or more repos
  const isReady = useMemo(() => repos.length >= 2, [repos]);

  // Helper to add logs
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: generateId(),
      message,
      timestamp: new Date(),
      type
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  // Update a specific step's status
  const updateStepStatus = (type: ActionType, status: StepStatus) => {
    setPipelineStatus((prev) => ({
      ...prev,
      [type]: status
    }));
  };

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        setServerStatus('connecting');
        addLog('Connecting to server...', 'info');
        
        await api.checkHealth();
        setServerStatus('connected');
        addLog('System online.', 'success');
        
        const data = await api.getRepos();
        if (data.repos) {
          const mappedRepos: Repository[] = data.repos.map((r: any) => ({
            id: r.id || generateId(),
            url: r.url,
            addedAt: r.addedAt ? new Date(r.addedAt) : new Date(),
            summary: r.summary
          }));
          setRepos(mappedRepos);
          if (mappedRepos.length > 0) {
            addLog(`Loaded ${mappedRepos.length} repositories from cloud.`, 'info');
          }
        }
      } catch (err: any) {
        setServerStatus('error');
        addLog(`Connection failed: ${err.message}`, 'error');
      }
    };
    init();
  }, [addLog]);

  // Handler: Auth
  const handleLogin = () => {
    addLog('Redirecting to GitHub OAuth provider...', 'info');
    setTimeout(() => {
      setUser({
        name: 'Developer',
        username: 'developer',
        avatarUrl: 'https://github.com/ghost.png'
      });
      addLog('Successfully signed in as @developer.', 'success');
    }, 1200);
  };

  const handleLogout = () => {
    setUser(null);
    addLog('User signed out.', 'info');
  };

  // Handler: Add Repository
  const handleAddRepo = async (url: string) => {
    if (repos.some((r) => r.url === url)) {
      addLog(`Repository already in list: ${url}`, 'warning');
      return;
    }

    // Clear logs to start fresh for this new workflow
    setLogs([]);

    // Reset pipeline statuses when new data is added, as previous analysis is now stale
    setPipelineStatus({
      [ActionType.ANALYZE]: 'idle',
      [ActionType.MATCH]: 'idle',
      [ActionType.GENERATE]: 'idle',
      [ActionType.INTEGRATE]: 'idle',
      [ActionType.VALIDATE]: 'idle',
      [ActionType.APPLY]: 'idle',
    });

    try {
      addLog(`Adding repository: ${url}...`, 'info');
      const data = await api.addRepo(url);
      
      const newRepo: Repository = {
        id: data.id || generateId(),
        url: data.url,
        addedAt: data.addedAt ? new Date(data.addedAt) : new Date(),
      };

      setRepos((prev) => [...prev, newRepo]);
      addLog(`Repository added successfully.`, 'success');
    } catch (err: any) {
      addLog(`Failed to add repo: ${err.message}`, 'error');
    }
  };

  // Handler: Remove Repository
  const handleRemoveRepo = async (id: string) => {
    const repoToRemove = repos.find((r) => r.id === id);
    if (!repoToRemove) return;

    const previousRepos = [...repos];
    setRepos((prev) => prev.filter((r) => r.id !== id));
    
    // Reset pipeline on change
    setPipelineStatus({
      [ActionType.ANALYZE]: 'idle',
      [ActionType.MATCH]: 'idle',
      [ActionType.GENERATE]: 'idle',
      [ActionType.INTEGRATE]: 'idle',
      [ActionType.VALIDATE]: 'idle',
      [ActionType.APPLY]: 'idle',
    });

    try {
      await api.deleteRepo(id);
      addLog(`Repository removed: ${repoToRemove.url}`, 'info');
    } catch (err: any) {
      setRepos(previousRepos);
      addLog(`Failed to remove repo (Server error): ${err.message}`, 'error');
    }
  };

  // Specific Handler for SSE (Server-Sent Events)
  const handleRunAllStream = () => {
    setIsProcessing(true);
    // Reset individual statuses for a fresh run
    setPipelineStatus({
      [ActionType.ANALYZE]: 'loading',
      [ActionType.MATCH]: 'idle',
      [ActionType.GENERATE]: 'idle',
      [ActionType.INTEGRATE]: 'idle',
      [ActionType.VALIDATE]: 'idle',
      [ActionType.APPLY]: 'idle',
    });
    
    addLog('Starting Auto-Pilot (Streaming)...', 'info');
    
    const eventSource = new EventSource(api.getRunAllStreamUrl());

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        let logType: LogEntry['type'] = 'info';
        if (data.type === 'success') logType = 'success';
        if (data.type === 'warning') logType = 'warning';
        if (data.type === 'error') logType = 'error';

        addLog(data.message, logType);
      } catch (e) {
        // Ignore parsing errors
      }
    };

    eventSource.addEventListener('complete', (event: MessageEvent) => {
      try {
        const result = JSON.parse(event.data);
        addLog('Auto-Pilot sequence completed successfully.', 'success');
        if (result.metrics?.summary) {
          addLog(result.metrics.summary, 'success');
        }
        
        // Mark all steps as success on successful completion of auto-pilot
        setPipelineStatus({
          [ActionType.ANALYZE]: 'success',
          [ActionType.MATCH]: 'success',
          [ActionType.GENERATE]: 'success',
          [ActionType.INTEGRATE]: 'success',
          [ActionType.VALIDATE]: 'success',
          [ActionType.APPLY]: 'idle', // Apply is usually a manual final step
        });
      } catch (e) {
        addLog('Sequence complete but failed to parse final result.', 'warning');
      }
      eventSource.close();
      setIsProcessing(false);
    });

    eventSource.onerror = () => {
      if (eventSource.readyState !== EventSource.CLOSED) {
         addLog('Connection lost or completed. Closing stream.', 'warning');
         eventSource.close();
      }
      setIsProcessing(false);
    };
  };

  // Handler: Action Buttons
  const handleAction = async (type: ActionType) => {
    if (type === ActionType.RUN_ALL) {
      handleRunAllStream();
      return;
    }

    if (type === ActionType.RESET) {
      if (window.confirm('Are you sure you want to reset all data? This will clear all repositories.')) {
         addLog('Resetting project...', 'warning');
         try {
           await api.reset();
           setRepos([]);
           setPipelineStatus({
             [ActionType.ANALYZE]: 'idle',
             [ActionType.MATCH]: 'idle',
             [ActionType.GENERATE]: 'idle',
             [ActionType.INTEGRATE]: 'idle',
             [ActionType.VALIDATE]: 'idle',
             [ActionType.APPLY]: 'idle',
           });
           
           // Clear logs for a completely fresh start, then show success
           setLogs([]);
           addLog('Project reset successfully.', 'success');
         } catch(e: any) {
           addLog(`Reset failed: ${e.message}`, 'error');
         }
      }
      return;
    }

    // Manual Actions
    setIsProcessing(true);
    updateStepStatus(type, 'loading');

    try {
      switch (type) {
        case ActionType.ANALYZE:
          addLog('Running Analysis...', 'info');
          const resAnalyze = await api.analyze();
          addLog(`Analysis: Processed ${resAnalyze.results?.length || 0} repositories.`, 'success');
          updateStepStatus(type, 'success');
          break;

        case ActionType.MATCH:
          addLog('Matching Interfaces...', 'info');
          const resMatch = await api.match();
          addLog(`Match: ${resMatch.matched?.length || 0} API calls matched.`, 'success');
          if (resMatch.missingInBackend?.length > 0) {
             addLog(`Warning: ${resMatch.missingInBackend.length} endpoints missing in backend.`, 'warning');
          }
          updateStepStatus(type, 'success');
          break;

        case ActionType.GENERATE:
          addLog('Generating Glue Code...', 'info');
          await api.generate();
          addLog('Generate: Client SDK and Type definitions created.', 'success');
          updateStepStatus(type, 'success');
          break;
        
        case ActionType.INTEGRATE:
          addLog('Generating Docker Configuration...', 'info');
          const resInt = await api.integrate();
          addLog(`Integrate: Strategy '${resInt.strategy}' applied.`, 'success');
          updateStepStatus(type, 'success');
          break;

        case ActionType.VALIDATE:
          addLog('Validating Integration...', 'info');
          const resVal = await api.validate();
          if (resVal.success) {
            addLog('Validation: Integration is healthy.', 'success');
            updateStepStatus(type, 'success');
          } else {
            addLog(`Validation: Found issues.`, 'warning');
            resVal.fixes?.forEach((f: string) => addLog(`Fix: ${f}`, 'info'));
            updateStepStatus(type, 'error');
          }
          break;
        
        case ActionType.APPLY:
          addLog('Forking repositories and creating Pull Requests...', 'info');
          const resApply = await api.apply();
          
          if (resApply.results) {
             resApply.results.forEach((r: any) => {
               addLog(`PR Created: ${r.prUrl}`, 'success');
             });
             addLog('All changes applied successfully.', 'success');
             updateStepStatus(type, 'success');
          } else {
             addLog('Changes applied, but no PR details returned.', 'success');
             updateStepStatus(type, 'success');
          }
          break;
      }
    } catch (err: any) {
      addLog(`Operation failed: ${err.message}`, 'error');
      updateStepStatus(type, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        <Header 
          serverStatus={serverStatus} 
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <RepoInput onAddRepo={handleAddRepo} />

        <RepoList repos={repos} onRemoveRepo={handleRemoveRepo} />

        <ActionPanel 
          onAction={handleAction} 
          isReady={isReady} 
          isProcessing={isProcessing} 
          pipelineStatus={pipelineStatus}
        />

        <LogPanel logs={logs} />
        
        <footer className="mt-12 text-center text-gray-400 text-xs">
          <p>&copy; {new Date().getFullYear()} conect. Enterprise Build.</p>
        </footer>

      </div>
    </div>
  );
};

export default App;
