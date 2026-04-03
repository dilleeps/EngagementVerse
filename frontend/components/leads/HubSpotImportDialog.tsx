'use client';

import { useState } from 'react';

interface HubSpotImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (apiKey: string) => void;
  isLoading?: boolean;
  result?: { imported: number; skipped: number } | null;
}

export function HubSpotImportDialog({
  isOpen,
  onClose,
  onImport,
  isLoading = false,
  result = null,
}: HubSpotImportDialogProps) {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    if (!apiKey.trim()) return;
    onImport(apiKey.trim());
  };

  const handleClose = () => {
    setApiKey('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-black/[0.08] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          Import from HubSpot
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your HubSpot API key to import contacts as leads.
        </p>

        <div className="mt-4 flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            HubSpot API key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
          />
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-800">
              <span className="font-semibold">{result.imported}</span> contacts
              imported
              {result.skipped > 0 && (
                <>
                  , <span className="font-semibold">{result.skipped}</span>{' '}
                  skipped
                </>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              type="button"
              onClick={handleImport}
              disabled={isLoading || !apiKey.trim()}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isLoading ? 'Importing...' : 'Import contacts'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
