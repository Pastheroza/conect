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
  RESET = 'RESET'
}
