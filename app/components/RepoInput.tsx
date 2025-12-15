import React, { useState } from 'react';
import { Plus, GitBranch } from 'lucide-react';

interface RepoInputProps {
  onAddRepo: (url: string) => void;
}

export const RepoInput: React.FC<RepoInputProps> = ({ onAddRepo }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddRepo(url.trim());
      setUrl('');
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <GitBranch className="w-4 h-4" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">Add Repository</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/user/repository"
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all text-sm"
        />
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