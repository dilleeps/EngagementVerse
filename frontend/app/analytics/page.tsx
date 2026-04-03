'use client';

import { useAnalyticsSummary, useOutcomes, useChannelMix, useCampaignPerformance, useExportCSV } from '@/hooks/useAnalytics';
import { KPIRow } from '@/components/analytics/KPIRow';
import { OutcomesBarChart } from '@/components/analytics/OutcomesBarChart';
import { ChannelDonut } from '@/components/analytics/ChannelDonut';
import { CampaignPerfTable } from '@/components/analytics/CampaignPerfTable';

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary();
  const { data: outcomes, isLoading: outcomesLoading } = useOutcomes();
  const { data: channelMix, isLoading: channelLoading } = useChannelMix();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaignPerformance();
  const exportCSV = useExportCSV();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics & reports</h1>
        <button
          onClick={() => exportCSV.mutate()}
          disabled={exportCSV.isPending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {exportCSV.isPending ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {summaryLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : summary ? (
        <KPIRow summary={summary} />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {outcomesLoading ? (
          <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
        ) : outcomes ? (
          <OutcomesBarChart data={outcomes} />
        ) : null}

        {channelLoading ? (
          <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
        ) : channelMix ? (
          <ChannelDonut data={channelMix} />
        ) : null}
      </div>

      {campaignsLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      ) : campaigns ? (
        <CampaignPerfTable campaigns={campaigns} />
      ) : null}
    </div>
  );
}
