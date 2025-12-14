import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { RepoInput } from './components/RepoInput';
import { RepoList } from './components/RepoList';
import { ActionPanel } from './components/ActionPanel';
import { LogPanel } from './components/LogPanel';
import { Repository, LogEntry, ActionType } from './types';
import { api } from './api';
import { v4 as uuidv4 } from 'uuid';

// Simple ID generator fallback
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

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
        addLog('Server connected.', 'success');
        
        const data = await api.getRepos();
        if (data.repos) {
          // Map API response to our local state format
          const mappedRepos: Repository[] = data.repos.map((r: any) => ({
            id: r.id || generateId(), // If API doesn't return ID, we can't properly delete later, but we render it.
            url: r.url,
            addedAt: new Date() // Fallback as API doesn't return date
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
        id: data.id, // We need this ID for deletion
        url: data.url,
        addedAt: new Date(),
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

    // Use optimistic update for UI responsiveness, rollback on error could be added
    const previousRepos = [...repos];
    setRepos((prev) => prev.filter((r) => r.id !== id));
    
    try {
      await api.deleteRepo(id);
      addLog(`Repository removed: ${repoToRemove.url}`, 'info');
    } catch (err: any) {
      setRepos(previousRepos); // Rollback
      addLog(`Failed to remove repo (Server error): ${err.message}`, 'error');
    }
  };

  // Handler: Action Buttons
  const handleAction = async (type: ActionType) => {
    switch (type) {
      case ActionType.ANALYZE:
        try {
          addLog('Starting analysis pipeline...', 'info');
          const res = await api.analyze();
          addLog(`Analysis complete. Processed ${res.results?.length || 0} repositories.`, 'success');
          res.results?.forEach((r: any) => {
            addLog(`- ${r.url}: ${r.framework || 'Detected'}`, 'info');
          });
        } catch (err: any) {
          addLog(`Analysis failed: ${err.message}`, 'error');
        }
        break;
      
      case ActionType.INTEGRATE:
        try {
          addLog('Initiating integration...', 'info');
          const res = await api.integrate();
          addLog(`Integration strategy generated: ${res.strategy}`, 'success');
          addLog('Docker compose file created.', 'info');
        } catch (err: any) {
          addLog(`Integration failed: ${err.message}`, 'error');
        }
        break;

      case ActionType.SUGGESTIONS:
        try {
          addLog('Validating integration...', 'info');
          const res = await api.validate();
          if (res.success) {
            addLog('Validation successful! No issues found.', 'success');
          } else {
            addLog(`Validation found issues.`, 'warning');
            res.errors?.forEach((e: string) => addLog(`Issue: ${e}`, 'error'));
            res.fixes?.forEach((f: string) => addLog(`Suggestion: ${f}`, 'success'));
          }
        } catch (err: any) {
          addLog(`Validation failed: ${err.message}`, 'error');
        }
        break;
      
      case ActionType.RESET:
        if (window.confirm('Are you sure you want to reset all data? This will clear all repositories.')) {
           try {
             addLog('Resetting project...', 'warning');
             await api.reset();
             setRepos([]);
             setLogs([]); // Clear logs too? Or keep them to show reset happened? Let's clear for fresh start.
             addLog('Project reset successfully.', 'success');
           } catch (err: any) {
             addLog(`Reset failed: ${err.message}`, 'error');
           }
        }
        break;
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* 1. Header with Status */}
        <Header serverStatus={serverStatus} />

        {/* 2. Input Section */}
        <RepoInput onAddRepo={handleAddRepo} />

        {/* 3. Repository List */}
        <RepoList repos={repos} onRemoveRepo={handleRemoveRepo} />

        {/* 4. Actions */}
        <ActionPanel onAction={handleAction} isReady={isReady} />

        {/* 5. Output Logs */}
        <LogPanel logs={logs} />
        
        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-xs">
          <p>&copy; {new Date().getFullYear()} conect. MVP Build.</p>
        </footer>

      </div>
    </div>
  );
};

export default App;