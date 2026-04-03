'use client';

import { MetricGrid } from '@/components/ui/MetricGrid';
import { formatNumber, formatPercent, formatDuration } from '@/lib/utils';
import type { AnalyticsSummary } from '@/types';

interface KPIRowProps {
  summary: AnalyticsSummary;
}

export function KPIRow({ summary }: KPIRowProps) {
  const totalReached =
    (summary.callsByStatus['COMPLETED'] ?? 0) +
    (summary.callsByStatus['ESCALATED'] ?? 0);

  const completionRate =
    summary.totalCalls > 0 ? totalReached / summary.totalCalls : 0;

  const complianceScore = summary.avgSentiment;

  const kpis = [
    {
      label: 'Total HCPs Reached',
      value: formatNumber(totalReached),
      sublabel: `of ${formatNumber(summary.totalCalls)} total`,
    },
    {
      label: 'Completion Rate',
      value: formatPercent(completionRate),
      sublabel: 'calls completed',
    },
    {
      label: 'Avg Call Duration',
      value: formatDuration(summary.avgDuration),
      sublabel: 'minutes:seconds',
    },
    {
      label: 'MLR Compliance Score',
      value: formatPercent(complianceScore),
      sublabel: 'across campaigns',
    },
  ];

  return (
    <MetricGrid cols={4}>
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="border border-black/[0.08] rounded-lg bg-white p-4"
        >
          <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{kpi.value}</p>
          <p className="mt-0.5 text-xs text-gray-400">{kpi.sublabel}</p>
        </div>
      ))}
    </MetricGrid>
  );
}
