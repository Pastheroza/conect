import React, { useState } from 'react';
import { Plus, LayoutTemplate, Server } from 'lucide-react';
import { RepoRole } from '../types';

interface RepoInputProps {
  onAddRepo: (url: string, role: RepoRole) => void;
}

export const RepoInput: React.FC<RepoInputProps> = ({ onAddRepo }) => {
  const [frontendUrl, setFrontendUrl] = useState('');
  const [backendUrl, setBackendUrl] = useState('');

  const handleAddFrontend = (e: React.FormEvent) => {
    e.preventDefault();
    if (frontendUrl.trim()) {
      onAddRepo(frontendUrl.trim(), 'frontend');
      setFrontendUrl('');
    }
  };

  const handleAddBackend = (e: React.FormEvent) => {
    e.preventDefault();
    if (backendUrl.trim()) {
      onAddRepo(backendUrl.trim(), 'backend');
      setBackendUrl('');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Frontend Input Section */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-blue-700">
          <LayoutTemplate className="w-4 h-4" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Frontend Repository</h3>
        </div>
        <form onSubmit={handleAddFrontend} className="flex flex-col gap-3">
          <input
            type="text"
            value={frontendUrl}
            onChange={(e) => setFrontendUrl(e.target.value)}
            placeholder="https://github.com/user/frontend-repo"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!frontendUrl.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Frontend
          </button>
        </form>
      </div>

      {/* Backend Input Section */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-emerald-700">
          <Server className="w-4 h-4" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Backend Repository</h3>
        </div>
        <form onSubmit={handleAddBackend} className="flex flex-col gap-3">
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="https://github.com/user/backend-api"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!backendUrl.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Backend
          </button>
        </form>
      </div>
    </div>
  );
};