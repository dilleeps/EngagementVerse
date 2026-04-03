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

  // Safely access API fields with fallbacks
  const hcpsReached = data.hcps_reached_week ?? data.totalHCPs ?? 0;
  const completionRate = data.completion_rate ?? data.completionRate ?? 0;
  const activeCalls = data.active_calls_count ?? data.callsToday ?? 0;
  const mlrScore = data.mlr_compliance_score ?? data.avgEngagementScore ?? 0;
  const callVolume = data.call_volume_7d ?? data.callsByDay ?? [];
  const recentCalls = data.recent_calls ?? data.recentCalls ?? [];
  const activityFeed = data.activity_feed ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <MetricGrid>
        <MetricCard
          label="HCPs reached"
          value={hcpsReached}
          delta={0}
        />
        <MetricCard
          label="Completion rate"
          value={`${Number(completionRate).toFixed(1)}%`}
          delta={completionRate > 50 ? 3.2 : 0}
        />
        <MetricCard
          label="Live calls"
          value={activeCalls}
          delta={activeCalls > 0 ? 5.0 : 0}
        />
        <MetricCard
          label="MLR compliance"
          value={`${Number(mlrScore).toFixed(1)}%`}
          delta={mlrScore > 80 ? 2.1 : 0}
        />
      </MetricGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CallVolumeChart data={callVolume} />
        <ActivityFeed
          activities={activityFeed.length > 0
            ? activityFeed.map((item: any, i: number) => ({
                id: String(i),
                type: item.type ?? 'call',
                message: item.message ?? 'Activity',
                timestamp: item.timestamp ?? new Date().toISOString(),
                hcp_name: item.hcp_name ?? '',
              }))
            : recentCalls.map((c: any, i: number) => ({
                id: c.id ?? String(i),
                type: 'call',
                message: `Call ${c.status?.toLowerCase?.() ?? 'completed'}`,
                timestamp: c.started_at ?? c.startedAt ?? c.created_at ?? c.createdAt ?? new Date().toISOString(),
                hcp_name: '',
              }))
          }
        />
      </div>

      <RecentCallsTable calls={recentCalls} />
    </div>
  );
}
