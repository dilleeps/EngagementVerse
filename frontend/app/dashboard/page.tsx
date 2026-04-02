'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CallVolumeChart } from '@/components/dashboard/CallVolumeChart';
import { RecentCallsTable } from '@/components/dashboard/RecentCallsTable';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { MetricGrid } from '@/components/ui/MetricGrid';

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-black/[0.08] bg-white p-4">
      <div className="h-8 w-24 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-32 rounded bg-gray-100" />
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-black/[0.08] bg-white p-4 ${className ?? ''}`}
    >
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="mt-4 h-48 rounded bg-gray-100" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        <MetricGrid>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </MetricGrid>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>

        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  const hcpDelta =
    data.totalHCPs > 0
      ? ((data.callsThisWeek / data.totalHCPs) * 100 - 50) * 0.1
      : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <MetricGrid>
        <MetricCard
          label="HCPs reached"
          value={data.totalHCPs}
          delta={hcpDelta}
        />
        <MetricCard
          label="Completion rate"
          value={`${data.completionRate.toFixed(1)}%`}
          delta={data.completionRate > 50 ? 3.2 : -1.5}
        />
        <MetricCard
          label="Live calls"
          value={data.callsToday}
          delta={data.callsToday > 0 ? 5.0 : 0}
        />
        <MetricCard
          label="Avg engagement"
          value={data.avgEngagementScore.toFixed(1)}
          delta={data.avgEngagementScore > 50 ? 2.1 : -0.8}
          suffix="/100"
        />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CallVolumeChart
          data={
            data.recentCalls?.map((c) => ({
              date: c.startedAt ?? c.createdAt,
              count: 1,
            })) ?? []
          }
        />
        <ActivityFeed
          insights={data.topInsights ?? []}
          campaigns={data.upcomingCampaigns ?? []}
        />
      </div>

      <RecentCallsTable calls={data.recentCalls ?? []} />
    </div>
  );
}
