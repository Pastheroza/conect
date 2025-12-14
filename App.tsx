import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { RepoInput } from './components/RepoInput';
import { RepoList } from './components/RepoList';
import { ActionPanel } from './components/ActionPanel';
import { LogPanel } from './components/LogPanel';
import { Repository, LogEntry, ActionType, User } from './types';
import { api } from './api';
import { v4 as uuidv4 } from 'uuid';

// Simple ID generator fallback
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [user, setUser] = useState<User | null>(null);
  
  // Track if a pipeline is running to disable buttons
  const [isProcessing, setIsProcessing] = useState(false);

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
            id: r.id || generateId(), // Ensure ID exists for React keys/deletes
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

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Handler: Remove Repository
  const handleRemoveRepo = async (id: string) => {
    const repoToRemove = repos.find((r) => r.id === id);
    if (!repoToRemove) return;

    const previousRepos = [...repos];
    setRepos((prev) => prev.filter((r) => r.id !== id));
    
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
    addLog('Starting Auto-Pilot (Streaming)...', 'info');
    
    const eventSource = new EventSource(api.getRunAllStreamUrl());

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Map API types to local log types
        let logType: LogEntry['type'] = 'info';
        if (data.type === 'success') logType = 'success';
        if (data.type === 'warning') logType = 'warning';
        if (data.type === 'error') logType = 'error';

        addLog(data.message, logType);
      } catch (e) {
        // Ignore parsing errors for pings/comments
      }
    };

    // Listen for the custom 'complete' event defined in API doc
    eventSource.addEventListener('complete', (event: MessageEvent) => {
      try {
        const result = JSON.parse(event.data);
        addLog('Auto-Pilot sequence completed successfully.', 'success');
        
        if (result.metrics?.summary) {
          addLog(result.metrics.summary, 'success');
        }
      } catch (e) {
        addLog('Sequence complete but failed to parse final result.', 'warning');
      }
      eventSource.close();
      setIsProcessing(false);
    });

    eventSource.onerror = () => {
      // In production, you might want to retry, but for MVP we close
      // Note: EventSource tries to reconnect automatically by default, 
      // but if we get a fatal error or network down, we might want to stop.
      // For now, let's close on error to prevent infinite error loops in UI
      // if the server is actually down.
      if (eventSource.readyState === EventSource.CLOSED) {
         setIsProcessing(false);
      } else {
         addLog('Connection lost or completed. Closing stream.', 'warning');
         eventSource.close();
         setIsProcessing(false);
      }
    };
  };

  // Handler: Action Buttons
  const handleAction = async (type: ActionType) => {
    if (type === ActionType.RUN_ALL) {
      handleRunAllStream();
      return;
    }

    // Manual Actions
    setIsProcessing(true);
    try {
      switch (type) {
        case ActionType.ANALYZE:
          addLog('Running Analysis...', 'info');
          const resAnalyze = await api.analyze();
          addLog(`Analysis: Processed ${resAnalyze.results?.length || 0} repositories.`, 'success');
          break;

        case ActionType.MATCH:
          addLog('Matching Interfaces...', 'info');
          const resMatch = await api.match();
          addLog(`Match: ${resMatch.matched?.length || 0} API calls matched.`, 'success');
          if (resMatch.missingInBackend?.length > 0) {
             addLog(`Warning: ${resMatch.missingInBackend.length} endpoints missing in backend.`, 'warning');
          }
          break;

        case ActionType.GENERATE:
          addLog('Generating Glue Code...', 'info');
          const resGen = await api.generate();
          addLog('Generate: Client SDK and Type definitions created.', 'success');
          break;
        
        case ActionType.INTEGRATE:
          addLog('Generating Docker Configuration...', 'info');
          const resInt = await api.integrate();
          addLog(`Integrate: Strategy '${resInt.strategy}' applied.`, 'success');
          break;

        case ActionType.VALIDATE:
          addLog('Validating Integration...', 'info');
          const resVal = await api.validate();
          if (resVal.success) {
            addLog('Validation: Integration is healthy.', 'success');
          } else {
            addLog(`Validation: Found issues.`, 'warning');
            resVal.fixes?.forEach((f: string) => addLog(`Fix: ${f}`, 'info'));
          }
          break;
        
        case ActionType.RESET:
          if (window.confirm('Are you sure you want to reset all data? This will clear all repositories.')) {
             addLog('Resetting project...', 'warning');
             await api.reset();
             setRepos([]);
             addLog('Project reset successfully.', 'success');
          }
          break;
      }
    } catch (err: any) {
      addLog(`Operation failed: ${err.message}`, 'error');
    } finally {
      if (type !== ActionType.RESET) {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* 1. Header with Status & Auth */}
        <Header 
          serverStatus={serverStatus} 
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* 2. Input Section */}
        <RepoInput onAddRepo={handleAddRepo} />

        {/* 3. Repository List */}
        <RepoList repos={repos} onRemoveRepo={handleRemoveRepo} />

        {/* 4. Actions */}
        <ActionPanel 
          onAction={handleAction} 
          isReady={isReady} 
          isProcessing={isProcessing}
        />

        {/* 5. Output Logs */}
        <LogPanel logs={logs} />
        
        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-xs">
          <p>&copy; {new Date().getFullYear()} conect. Enterprise Build.</p>
        </footer>

      </div>
    </div>
  );
};

export default App;
