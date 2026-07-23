import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { StudioTheme } from '../types';

export function ValidatorModal({ theme, onConfirm, onCancel }: { theme: StudioTheme, onConfirm: () => void, onCancel: () => void }) {
  const checks = [
    { label: 'Theme Name provided', passed: !!theme.metadata.name },
    { label: 'Theme ID provided', passed: !!theme.metadata.id },
    { label: 'Thumbnail uploaded', passed: !!theme.assets.thumbnail },
    { label: 'Background uploaded', passed: !!theme.assets.background },
    { label: 'At least 1 tile uploaded', passed: Object.keys(theme.assets.tiles).length > 0 },
  ];

  const allPassed = checks.every(c => c.passed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Theme Validation</h2>
        
        <div className="space-y-3 mb-6">
          {checks.map((check, i) => (
            <div key={i} className="flex items-center gap-3">
              {check.passed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm ${check.passed ? 'text-slate-300' : 'text-slate-400'}`}>
                {check.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all ${
              allPassed 
                ? 'bg-pink-600 hover:bg-pink-500 shadow-lg shadow-pink-900/30' 
                : 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/30'
            }`}
          >
            {allPassed ? 'Build Theme' : 'Build Anyway'}
          </button>
        </div>
      </div>
    </div>
  );
}
