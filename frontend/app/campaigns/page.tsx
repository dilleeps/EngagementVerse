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
  { value: 'PENDING_MLR', label: 'MLR review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
];

function statusToBadgeVariant(status?: string): "draft" | "approved" | "active" | "paused" | "completed" | "scheduled" | "live" | "queued" | "escalated" {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'active';
    case 'PAUSED': return 'paused';
    case 'APPROVED': return 'approved';
    case 'COMPLETED': return 'completed';
    case 'PENDING_MLR': return 'scheduled';
    default: return 'draft';
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

  // Handle both array and paginated response
  const campaigns: any[] = Array.isArray(data) ? data : (data?.items ?? []);

  const filtered = drugSearch
    ? campaigns.filter((c: any) =>
        (c.drug_name ?? c.drugName ?? c.name ?? '')
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
          <label className="text-xs font-medium text-gray-500">Drug name</label>
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

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg border border-black/[0.08] bg-white" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign: any) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="group rounded-lg border border-black/[0.08] bg-white p-5 hover:border-brand/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors">
                  {campaign.name ?? 'Untitled'}
                </h3>
                <Badge variant={statusToBadgeVariant(campaign.status)}>
                  {(campaign.status ?? 'DRAFT').replace(/_/g, ' ')}
                </Badge>
              </div>

              {(campaign.drug_name ?? campaign.drugName) && (
                <p className="mt-1 text-xs text-gray-500">
                  {campaign.drug_name ?? campaign.drugName}
                </p>
              )}

              {(campaign.communication_type ?? campaign.communicationType) && (
                <p className="mt-2 text-xs text-gray-400">
                  {(campaign.communication_type ?? campaign.communicationType ?? '').replace(/_/g, ' ')}
                </p>
              )}

              {campaign.scheduled_at && (
                <p className="mt-2 text-xs text-gray-500">
                  Scheduled {new Date(campaign.scheduled_at).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title="No campaigns found"
          description="Get started by creating your first campaign or adjust your filters."
        />
      )}
    </div>
  );
}
