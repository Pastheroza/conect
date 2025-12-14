import React from 'react';
import { Repository } from '../types';
import { Trash2, GitBranch, LayoutTemplate, Server } from 'lucide-react';

interface RepoListProps {
  repos: Repository[];
  onRemoveRepo: (id: string) => void;
}

export const RepoList: React.FC<RepoListProps> = ({ repos, onRemoveRepo }) => {
  if (repos.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg mb-8 bg-gray-50/50">
        <p className="text-gray-400 text-sm">Add at least one Frontend and one Backend repository to start.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-8">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Project Composition ({repos.length})
      </h2>
      <div className="grid gap-3">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="group flex items-center justify-between p-3 pl-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2 rounded-md ${
                repo.role === 'frontend' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {repo.role === 'frontend' ? <LayoutTemplate className="w-4 h-4" /> : <Server className="w-4 h-4" />}
              </div>
              
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                     repo.role === 'frontend' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {repo.role}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 truncate mt-0.5">
                  {repo.url}
                </span>
              </div>
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