/**
 * Defines the role of the repository in the project.
 */
export type RepoRole = 'frontend' | 'backend';

/**
 * Represents a single Git repository added by the user.
 */
export interface Repository {
  id: string;
  url: string;
  role: RepoRole;
  addedAt: Date;
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
 * Available action types for the action buttons.
 */
export enum ActionType {
  ANALYZE = 'ANALYZE',
  INTEGRATE = 'INTEGRATE',
  GENERATE = 'GENERATE',
  HISTORY = 'HISTORY',
  RESET = 'RESET'
}