import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface LogPanelProps {
  logs: LogEntry[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getTimeString = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-800">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-950 border-b border-gray-800">
        <Terminal className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Output Log</span>
      </div>
      <div className="p-4 h-48 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">Waiting for activity...</div>
        ) : (
          <div className="flex flex-col gap-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="text-gray-600 select-none">[{getTimeString(log.timestamp)}]</span>
                <span className={getLogColor(log.type)}>
                  {log.type === 'success' && '✓ '}
                  {log.type === 'error' && '✗ '}
                  {log.type === 'warning' && '! '}
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};