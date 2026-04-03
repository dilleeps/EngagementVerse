'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCampaigns } from '@/hooks/useCampaign';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CampaignFilters } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'MLR_REVIEW', label: 'MLR review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
];

function campaignStatusVariant(
  status: string,
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAUSED':
      return 'warning';
    case 'DRAFT':
      return 'default';
    case 'MLR_REVIEW':
      return 'info';
    case 'APPROVED':
      return 'success';
    case 'COMPLETED':
      return 'default';
    default:
      return 'default';
  }
}

export default function CampaignsPage() {
  const [filters, setFilters] = useState<CampaignFilters>({
    status: undefined,
    page: 1,
    size: 20,
  });
  const [drugSearch, setDrugSearch] = useState('');

  const { data, isLoading } = useCampaigns(filters);

  const campaigns = data?.items ?? [];
  const total = data?.total ?? 0;

  // Client-side drug name filter
  const filtered = drugSearch
    ? campaigns.filter((c) =>
        (c.drugName ?? c.name)
          .toLowerCase()
          .includes(drugSearch.toLowerCase()),
      )
    : campaigns;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          New campaign
        </Link>
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
          <label className="text-xs font-medium text-gray-500">
            Drug name
          </label>
          <input
            type="text"
            value={drugSearch}
            onChange={(e) => setDrugSearch(e.target.value)}
            placeholder="Search drug..."
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <button
          onClick={() => {
            setFilters({ status: undefined, page: 1, size: 20 });
            setDrugSearch('');
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border border-black/[0.08] bg-white"
            />
          ))}
        </div>
      )}

      {/* Campaign cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="group rounded-lg border border-black/[0.08] bg-white p-5 hover:border-brand/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors">
                  {campaign.name}
                </h3>
                <Badge variant={campaignStatusVariant(campaign.status)}>
                  {campaign.status.replace('_', ' ')}
                </Badge>
              </div>

              {campaign.drugName && (
                <p className="mt-1 text-xs text-gray-500">
                  {campaign.drugName}
                </p>
              )}

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                {campaign.audienceSize != null && (
                  <span>
                    <span className="font-medium text-gray-700">
                      {campaign.audienceSize.toLocaleString()}
                    </span>{' '}
                    HCPs
                  </span>
                )}
                {campaign.scheduledAt && (
                  <span>
                    Scheduled{' '}
                    {new Date(campaign.scheduledAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {campaign.channels && campaign.channels.length > 0 && (
                <div className="mt-3 flex gap-1.5">
                  {campaign.channels.map((ch) => (
                    <span
                      key={ch}
                      className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title="No campaigns found"
          description="Get started by creating your first campaign or adjust your filters."
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
                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
              />
            </svg>
          }
        />
      )}
    </div>
  );
}
