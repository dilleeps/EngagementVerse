'use client';

import { useState } from 'react';
import { useCalls } from '@/hooks/useCallQueue';
import { CallQueue } from '@/components/calls/CallQueue';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CallFilters } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'LIVE', label: 'Live' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'NO_ANSWER', label: 'No answer' },
  { value: 'ESCALATED', label: 'Escalated' },
  { value: 'OPTED_OUT', label: 'Opted out' },
];

export default function CallsPage() {
  const [filters, setFilters] = useState<CallFilters>({
    status: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    page: 1,
    size: 20,
  });

  const { data, isLoading } = useCalls(filters);

  const calls = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">AI calls</h1>
        <span className="text-sm text-gray-500">
          {total} call{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Status</label>
          <select
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value || undefined,
                page: 1,
              }))
            }
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">From</label>
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                dateFrom: e.target.value || undefined,
                page: 1,
              }))
            }
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">To</label>
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                dateTo: e.target.value || undefined,
                page: 1,
              }))
            }
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <button
          onClick={() =>
            setFilters({
              status: undefined,
              dateFrom: undefined,
              dateTo: undefined,
              page: 1,
              size: 20,
            })
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-black/[0.08] bg-white"
            />
          ))}
        </div>
      )}

      {/* Call queue list */}
      {!isLoading && calls.length > 0 && (
        <>
          <CallQueue
            items={calls.map((call, idx) => ({
              id: call.id,
              callSessionId: call.id,
              hcpId: call.hcpId,
              hcpName: call.hcp
                ? `${call.hcp.firstName} ${call.hcp.lastName}`
                : 'Unknown HCP',
              hcpSpecialty: call.hcp?.specialty ?? 'OTHER',
              kolTier: call.hcp?.kolTier ?? 'NONE',
              campaignName: call.campaign?.name ?? 'N/A',
              channel: call.channel,
              status: call.status,
              priorityOrder: idx,
              scheduledAt: call.startedAt ?? call.createdAt,
              estimatedDuration: call.durationSeconds ?? 180,
            }))}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">
              Page {filters.page ?? 1} of{' '}
              {Math.max(1, Math.ceil(total / (filters.size ?? 20)))}
            </p>
            <div className="flex gap-2">
              <button
                disabled={(filters.page ?? 1) <= 1}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page ?? 1) - 1,
                  }))
                }
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={
                  (filters.page ?? 1) >=
                  Math.ceil(total / (filters.size ?? 20))
                }
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page ?? 1) + 1,
                  }))
                }
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!isLoading && calls.length === 0 && (
        <EmptyState
          title="No calls found"
          description="There are no calls matching your filters. Try adjusting your search criteria."
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
          }
        />
      )}
    </div>
  );
}
