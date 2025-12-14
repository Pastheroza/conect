import React from 'react';
import { Network } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="mb-10 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <Network className="w-8 h-8 text-black" />
        </div>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
        conect
      </h1>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
        Connect multiple Git repositories into one project
      </p>
    </header>
  );
};