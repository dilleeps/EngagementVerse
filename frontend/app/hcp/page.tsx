'use client';

import { useState } from 'react';
import { useHCPSearch } from '@/hooks/useHCPSearch';
import { HCPSearchBar } from '@/components/hcp/HCPSearchBar';
import { HCPCard } from '@/components/hcp/HCPCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { HCPSearchParams } from '@/types';

export default function HCPListPage() {
  const [params, setParams] = useState<HCPSearchParams>({
    q: '',
    page: 1,
    size: 12,
  });

  const { hcps, total, isLoading } = useHCPSearch(params);

  const totalPages = Math.max(1, Math.ceil(total / (params.size ?? 12)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">HCP profiles</h1>
        <span className="text-sm text-gray-500">
          {total} profile{total !== 1 ? 's' : ''}
        </span>
      </div>

      <HCPSearchBar
        value={params.q ?? ''}
        onChange={(q: string) => setParams((prev) => ({ ...prev, q, page: 1 }))}
        specialty={params.specialty}
        onSpecialtyChange={(specialty: string | undefined) =>
          setParams((prev) => ({ ...prev, specialty, page: 1 }))
        }
        kolTier={params.kolTier}
        onKolTierChange={(kolTier: string | undefined) =>
          setParams((prev) => ({ ...prev, kolTier, page: 1 }))
        }
      />

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-lg border border-black/[0.08] bg-white"
            />
          ))}
        </div>
      )}

      {/* HCP grid */}
      {!isLoading && hcps.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hcps.map((hcp) => (
              <HCPCard key={hcp.id} hcp={hcp} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Page {params.page ?? 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={(params.page ?? 1) <= 1}
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      page: (prev.page ?? 1) - 1,
                    }))
                  }
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={(params.page ?? 1) >= totalPages}
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      page: (prev.page ?? 1) + 1,
                    }))
                  }
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!isLoading && hcps.length === 0 && (
        <EmptyState
          title="No HCPs found"
          description="Try adjusting your search or filter criteria to find healthcare professionals."
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          }
        />
      )}
    </div>
  );
}
