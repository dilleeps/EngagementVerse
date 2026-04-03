'use client';

import { Sparkline } from '@/components/ui/Sparkline';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface CampaignPerf {
  id: string;
  name: string;
  targeted: number;
  reached: number;
  completion_pct: number;
  escalations: number;
  sparkline: number[];
}

interface CampaignPerfTableProps {
  campaigns: CampaignPerf[];
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
              <th className="pb-3 pr-4">Reached</th>
              <th className="pb-3 pr-4 w-32">Completion</th>
              <th className="pb-3 pr-4">Escalations</th>
              <th className="pb-3 w-28">7-day trend</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">{c.name}</td>
                <td className="py-3 pr-4 text-gray-600">{c.targeted.toLocaleString()}</td>
                <td className="py-3 pr-4 text-gray-600">{c.reached.toLocaleString()}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={c.completion_pct} />
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {c.completion_pct.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-600">{c.escalations}</td>
                <td className="py-3">
                  <Sparkline data={c.sparkline} />
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
