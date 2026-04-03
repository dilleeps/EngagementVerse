'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { MLRStatusBadge } from '../MLRStatusBadge';
import type { MLRStatus } from '@/types';

interface ScriptVersion {
  version: number;
  status: MLRStatus;
  uploadedAt: string;
  reviewer: string | null;
  fileName: string;
}

interface Step3ScriptProps {
  campaignId?: string;
}

export function Step3Script({ campaignId }: Step3ScriptProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentStatus, setCurrentStatus] = useState<MLRStatus>('DRAFT');
  const [currentVersion, setCurrentVersion] = useState('1');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock version history - in a real app this would come from API
  const [versions] = useState<ScriptVersion[]>([
    {
      version: 2,
      status: 'IN_REVIEW',
      uploadedAt: '2026-03-28T10:00:00Z',
      reviewer: 'Dr. Sarah Chen',
      fileName: 'script_v2.pdf',
    },
    {
      version: 1,
      status: 'REJECTED',
      uploadedAt: '2026-03-20T14:30:00Z',
      reviewer: 'Dr. Sarah Chen',
      fileName: 'script_v1.pdf',
    },
  ]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setCurrentFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentFile(file);
    }
  };

  const statusBadgeVariant = (status: MLRStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'draft';
      case 'IN_REVIEW':
        return 'scheduled';
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
    }
  };

  return (
    <div className="space-y-5">
      {/* Current MLR Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Current Status:</span>
        <MLRStatusBadge status={currentStatus} version={currentVersion} />
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors',
          isDragging
            ? 'border-brand bg-brand-light'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        <svg
          className="mb-3 h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          {currentFile ? currentFile.name : 'Drop your MLR script here'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {currentFile
            ? `${(currentFile.size / 1024).toFixed(1)} KB`
            : 'PDF, DOCX, or TXT up to 10MB'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {currentFile && (
        <button
          type="button"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          Upload Script
        </button>
      )}

      {/* Version History */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Version History</h4>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {versions.map((v) => (
                <tr key={v.version} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium text-gray-900">
                    v{v.version}
                    <span className="ml-1 text-xs text-gray-400">{v.fileName}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={statusBadgeVariant(v.status)}>
                      {v.status === 'IN_REVIEW' ? 'In Review' : v.status.charAt(0) + v.status.slice(1).toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">
                    {formatDate(v.uploadedAt)}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">
                    {v.reviewer ?? <span className="text-gray-300">--</span>}
                  </td>
                </tr>
              ))}
              {versions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                    No versions uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
