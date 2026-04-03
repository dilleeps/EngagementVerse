'use client';

import { useRef, useState } from 'react';

interface TemplatePreviewProps {
  subject: string;
  body: string;
  previewText?: string;
}

export function TemplatePreview({ subject, body, previewText }: TemplatePreviewProps) {
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 2.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <div className="rounded-lg border border-black/[0.08] bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-black/[0.08] px-4 py-2 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Zoom out"
          >
            -
          </button>
          <button
            onClick={resetZoom}
            className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* Subject line */}
      <div className="border-b border-black/[0.08] px-4 py-3">
        <p className="text-xs text-gray-400 mb-0.5">Subject</p>
        <p className="text-sm font-medium text-gray-900">{subject || 'No subject'}</p>
        {previewText && (
          <p className="mt-1 text-xs text-gray-400 italic">{previewText}</p>
        )}
      </div>

      {/* Body */}
      <div
        ref={containerRef}
        className="overflow-auto bg-white"
        style={{ maxHeight: '500px' }}
      >
        <div
          className="p-4 origin-top-left"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <div
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: body || '<p class="text-gray-400">No content</p>' }}
          />
        </div>
      </div>
    </div>
  );
}
