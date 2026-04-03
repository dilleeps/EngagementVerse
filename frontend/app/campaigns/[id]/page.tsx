'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCampaign, useLaunchCampaign, usePauseCampaign } from '@/hooks/useCampaign';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: campaign, isLoading } = useCampaign(id);
  const launchMutation = useLaunchCampaign();
  const pauseMutation = usePauseCampaign();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg border border-black/[0.08] bg-white" />
      </div>
    );
  }

  if (!campaign) {
    return <div className="py-12 text-center text-gray-500">Campaign not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{campaign.name}</h1>
            <Badge status={campaign.status?.toLowerCase() ?? 'draft'} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {campaign.drug_name} &middot; {campaign.communication_type?.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'APPROVED' && (
            <button
              onClick={() => launchMutation.mutate(id)}
              disabled={launchMutation.isPending}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Launch
            </button>
          )}
          {campaign.status === 'ACTIVE' && (
            <button
              onClick={() => pauseMutation.mutate(id)}
              disabled={pauseMutation.isPending}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Pause
            </button>
          )}
          <Link
            href="/campaigns"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back to campaigns
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-6">
            <h2 className="mb-4 text-sm font-medium text-gray-700">Overview</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium">{campaign.created_at ? formatDate(campaign.created_at) : 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Scheduled</dt>
                <dd className="font-medium">{campaign.scheduled_at ? formatDate(campaign.scheduled_at) : 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">MLR script version</dt>
                <dd className="font-medium">{campaign.mlr_script_version || 'None'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Communication type</dt>
                <dd className="font-medium">{campaign.communication_type?.replace(/_/g, ' ')}</dd>
              </div>
            </dl>
          </div>

          {/* Audience section */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-6">
            <h2 className="mb-4 text-sm font-medium text-gray-700">Audience</h2>
            <p className="text-sm text-gray-500">
              Audience details will be loaded here with HCP selections and targeting criteria.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-700">Campaign status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge status={campaign.status?.toLowerCase() ?? 'draft'} />
              </div>
              {campaign.mlr_approved_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">MLR approved</span>
                  <span>{formatDate(campaign.mlr_approved_at)}</span>
                </div>
              )}
              {campaign.completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed</span>
                  <span>{formatDate(campaign.completed_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
