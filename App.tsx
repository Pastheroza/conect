import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { RepoInput } from './components/RepoInput';
import { RepoList } from './components/RepoList';
import { ActionPanel } from './components/ActionPanel';
import { LogPanel } from './components/LogPanel';
import { Repository, LogEntry, ActionType } from './types';
import { v4 as uuidv4 } from 'uuid'; // Note: In a real project, install uuid. Here we simulate or use a simple random string.

// Simple ID generator fallback if uuid is not available in the environment
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

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

  // Handler: Add Repository
  const handleAddRepo = (url: string) => {
    // Basic validation
    if (repos.some((r) => r.url === url)) {
      addLog(`Repository already in list: ${url}`, 'warning');
      return;
    }

    const newRepo: Repository = {
      id: generateId(),
      url,
      addedAt: new Date(),
    };

    setRepos((prev) => [...prev, newRepo]);
    addLog(`Repository added: ${url}`, 'success');
  };

  // Handler: Remove Repository
  const handleRemoveRepo = (id: string) => {
    const repoToRemove = repos.find((r) => r.id === id);
    if (repoToRemove) {
      setRepos((prev) => prev.filter((r) => r.id !== id));
      addLog(`Repository removed: ${repoToRemove.url}`, 'info');
    }
  };

  // Handler: Action Buttons
  const handleAction = (type: ActionType) => {
    switch (type) {
      case ActionType.ANALYZE:
        addLog(`Analyzing ${repos.length} repositories...`, 'info');
        setTimeout(() => addLog('Analysis complete. No conflicts found.', 'success'), 1000);
        break;
      
      case ActionType.INTEGRATE:
        addLog('Integration sequence initiated...', 'info');
        setTimeout(() => addLog('Waiting for backend logic...', 'warning'), 800);
        break;
      
      case ActionType.GENERATE:
        addLog('Generating project structure...', 'info');
        setTimeout(() => addLog('Project blueprint ready.', 'success'), 1200);
        break;
      
      case ActionType.RESET:
        if (confirm('Are you sure you want to clear all repositories and logs?')) {
          setRepos([]);
          setLogs([]);
          // We don't log this since we just cleared the logs!
          // But let's add an initial log to show state.
          setTimeout(() => addLog('System reset.', 'info'), 100);
        }
        break;
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        {/* 1. Header */}
        <Header />

        {/* 2. Input Section */}
        <RepoInput onAddRepo={handleAddRepo} />

        {/* 3. Repository List */}
        <RepoList repos={repos} onRemoveRepo={handleRemoveRepo} />

        {/* 4. Actions */}
        <ActionPanel onAction={handleAction} hasRepos={repos.length > 0} />

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