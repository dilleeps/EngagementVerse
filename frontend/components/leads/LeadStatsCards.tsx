'use client';

import { MetricGrid } from '@/components/ui/MetricGrid';
import type { LeadStats } from '@/hooks/useLeads';

function formatCurrency(value?: number): string {
  if (value == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface LeadStatsCardsProps {
  stats?: LeadStats | null;
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function LeadStatsCards({ stats }: LeadStatsCardsProps) {
  return (
    <MetricGrid cols={4} className="lg:grid-cols-5">
      <StatCard label="Total leads" value={String(stats?.total ?? 0)} />
      <StatCard label="Qualified" value={String(stats?.qualified ?? 0)} />
      <StatCard
        label="In Pipeline"
        value={formatCurrency(stats?.pipeline_value)}
      />
      <StatCard label="Won" value={formatCurrency(stats?.won_value)} />
      <StatCard
        label="Conversion Rate"
        value={`${(stats?.conversion_rate ?? 0).toFixed(1)}%`}
      />
    </MetricGrid>
  );
}
