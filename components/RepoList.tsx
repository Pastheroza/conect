import React from 'react';
import { Repository } from '../types';
import { Trash2, GitBranch } from 'lucide-react';

interface RepoListProps {
  repos: Repository[];
  onRemoveRepo: (id: string) => void;
}

export const RepoList: React.FC<RepoListProps> = ({ repos, onRemoveRepo }) => {
  if (repos.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg mb-8">
        <p className="text-gray-400 text-sm">No repositories added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-8">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Added Repositories ({repos.length})
      </h2>
      <div className="grid gap-3">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-gray-50 rounded-md">
                <GitBranch className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">
                {repo.url}
              </span>
            </div>
            <button
              onClick={() => onRemoveRepo(repo.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              aria-label="Remove repository"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};