'use client';

import { cn } from '@/lib/utils';
import type { MLRStatus } from '@/types';

interface MLRStatusBadgeProps {
  status: MLRStatus;
  version: string;
}

const statusStyles: Record<MLRStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
  IN_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels: Record<MLRStatus, string> = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function MLRStatusBadge({ status, version }: MLRStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status]
      )}
    >
      v{version} &middot; {statusLabels[status]}
    </span>
  );
}
