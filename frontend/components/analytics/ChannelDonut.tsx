'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChannelMixData, Channel } from '@/types';

interface ChannelDonutProps {
  data: ChannelMixData[];
}

const CHANNEL_COLORS: Record<Channel, string> = {
  VOICE: '#0F766E',
  SMS: '#3B82F6',
  EMAIL: '#8B5CF6',
  DIGITAL: '#F59E0B',
};

const CHANNEL_LABELS: Record<Channel, string> = {
  VOICE: 'Voice',
  SMS: 'SMS',
  EMAIL: 'Email',
  DIGITAL: 'Digital',
};

export function ChannelDonut({ data }: ChannelDonutProps) {
  const total = data.reduce((sum, d) => sum + d.totalCalls, 0);

  const chartData = data.map((d) => ({
    name: CHANNEL_LABELS[d.channel],
    value: d.totalCalls,
    channel: d.channel,
  }));

  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Channel Distribution
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-sm text-gray-400">No channel data available.</span>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.channel}
                      fill={CHANNEL_COLORS[entry.channel]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [
                    value.toLocaleString(),
                    'Calls',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-gray-900">
                {total.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            {chartData.map((entry) => (
              <div key={entry.channel} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: CHANNEL_COLORS[entry.channel] }}
                />
                <span className="text-sm text-gray-700">{entry.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {entry.value.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">
                  ({total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
