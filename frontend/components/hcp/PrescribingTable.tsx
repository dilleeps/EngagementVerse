'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import type { PrescribingBehavior } from '@/types';

interface PrescribingTableProps {
  data: PrescribingBehavior[];
}

export function PrescribingTable({ data }: PrescribingTableProps) {
  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Prescribing Behavior
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drug Name
              </th>
              <th className="pb-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monthly Volume
              </th>
              <th className="pb-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-4">
                Share of Wallet
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => {
              const trendPercent = (
                ((row.trxCount - row.nbrxCount) / (row.nbrxCount || 1)) *
                100
              ).toFixed(1);
              const isUp = row.trend === 'UP';
              const isDown = row.trend === 'DOWN';

              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-900">
                    {row.drugName}
                  </td>
                  <td className="py-2.5 text-right text-gray-700">
                    {row.trxCount.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={
                        isUp
                          ? 'text-green-600'
                          : isDown
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }
                    >
                      {isUp ? '\u2191' : isDown ? '\u2193' : '\u2192'}{' '}
                      {Math.abs(Number(trendPercent))}%
                    </span>
                  </td>
                  <td className="py-2.5 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <ProgressBar value={row.marketShare * 100} />
                      </div>
                      <span className="text-xs text-gray-500">
                        {(row.marketShare * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <p className="py-6 text-center text-sm text-gray-400">
          No prescribing data available.
        </p>
      )}
    </div>
  );
}
