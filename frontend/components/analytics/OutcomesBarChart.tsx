'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { OutcomeData } from '@/types';

interface OutcomesBarChartProps {
  data: OutcomeData[];
}

const COLORS = [
  '#0F766E',   // brand teal - completed
  '#0F766ECC', // 80% opacity - escalated
  '#0F766E99', // 60% opacity - no_answer
  '#0F766E66', // 40% opacity - opted_out
];

export function OutcomesBarChart({ data }: OutcomesBarChartProps) {
  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Call Outcomes</h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-sm text-gray-400">No outcome data available.</span>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  'Count',
                ]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
