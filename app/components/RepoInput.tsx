import React, { useState } from 'react';
import { Plus, GitBranch, Building2 } from 'lucide-react';

interface RepoInputProps {
  onAddRepo: (url: string) => void;
  onAddOrg?: (org: string, includeForks: boolean) => void;
}

export const RepoInput: React.FC<RepoInputProps> = ({ onAddRepo, onAddOrg }) => {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'repo' | 'org'>('repo');
  const [includeForks, setIncludeForks] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    if (mode === 'org' && onAddOrg) {
      onAddOrg(url.trim(), includeForks);
    } else {
      onAddRepo(url.trim());
    }
    setUrl('');
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          {mode === 'repo' ? <GitBranch className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
          <h3 className="text-sm font-semibold uppercase tracking-wide">
            Add {mode === 'repo' ? 'Repository' : 'Organization'}
          </h3>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('repo')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mode === 'repo' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Repo
          </button>
          <button
            type="button"
            onClick={() => setMode('org')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mode === 'org' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Org
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={mode === 'repo' ? 'https://github.com/user/repository' : 'organization-name'}
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all text-sm"
        />
        {mode === 'org' && (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={includeForks}
              onChange={(e) => setIncludeForks(e.target.checked)}
              className="rounded border-gray-300"
            />
            Forks
          </label>
        )}
        <button
          type="submit"
          disabled={!url.trim()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>
    </div>
  );
};