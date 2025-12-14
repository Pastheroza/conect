import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface RepoInputProps {
  onAddRepo: (url: string) => void;
}

export const RepoInput: React.FC<RepoInputProps> = ({ onAddRepo }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddRepo(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
      <div className="relative flex-grow">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="https://github.com/user/repo"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!inputValue.trim()}
        className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Repository
      </button>
    </form>
  );
};