'use client';

import { Sparkline } from '@/components/ui/Sparkline';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CampaignPerformance } from '@/types';

interface CampaignPerfTableProps {
  campaigns: CampaignPerformance[];
}

export function CampaignPerfTable({ campaigns }: CampaignPerfTableProps) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white p-4">
      <h3 className="mb-4 text-sm font-medium text-gray-700">Campaign performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
              <th className="pb-3 pr-4">Campaign</th>
              <th className="pb-3 pr-4">Targeted</th>
              <th className="pb-3 pr-4">Completed</th>
              <th className="pb-3 pr-4 w-32">Completion</th>
              <th className="pb-3 pr-4">Avg engagement</th>
              <th className="pb-3 w-28">7-day trend</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.campaignId} className="border-b border-gray-50 last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">{c.campaignName}</td>
                <td className="py-3 pr-4 text-gray-600">{c.totalContacts.toLocaleString()}</td>
                <td className="py-3 pr-4 text-gray-600">{c.completedContacts.toLocaleString()}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={c.completionRate * 100} />
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {(c.completionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-600">{c.avgEngagement.toFixed(1)}</td>
                <td className="py-3">
                  <Sparkline data={c.dailyProgress.map(d => d.completed)} />
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No campaign data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
