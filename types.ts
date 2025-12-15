/**
 * Represents a single Git repository added by the user.
 */
export interface Repository {
  id: string;
  url: string;
  addedAt: Date;
  summary?: any; // Optional summary from analysis
}

/**
 * Represents a log entry displayed in the output panel.
 */
export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Represents the authenticated user.
 */
export interface User {
  username: string;
  name: string;
  avatarUrl: string;
}

/**
 * Available action types for the action buttons.
 */
export enum ActionType {
  RUN_ALL = 'RUN_ALL',
  ANALYZE = 'ANALYZE',
  MATCH = 'MATCH',
  GENERATE = 'GENERATE',
  INTEGRATE = 'INTEGRATE',
  VALIDATE = 'VALIDATE',
  APPLY = 'APPLY',
  RESET = 'RESET'
}

/**
 * Status of an individual pipeline step.
 */
export type StepStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Git Commit structure for History API
 */
export interface Commit {
  hash: string;
  message: string;
  date: string;
  author: string;
}

/**
 * Repo History structure
 */
export interface RepoHistory {
  repo: string;
  commits: Commit[];
}

/**
 * Validation Report structure
 */
export interface ValidationReport {
  status: string;
  reposAnalyzed: number;
  endpointsMatched: number;
  endpointsMissing: number;
  filesGenerated: string[];
  estimatedTimeSaved: string;
  summary: string;
}

/**
 * Async Job Structure
 */
export interface Job {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  logs: LogEntry[];
  result?: {
    metrics?: {
      summary: string;
    };
    // other result fields...
  };
  error?: string;
}
