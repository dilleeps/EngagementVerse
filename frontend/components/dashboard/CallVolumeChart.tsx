"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CallVolumeChartProps {
  data: { date: string; count: number }[];
}

function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function CallVolumeChart({ data }: CallVolumeChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    day: formatDayName(d.date),
  }));

  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Call volume</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.5rem",
                border: "1px solid rgba(0,0,0,0.08)",
                fontSize: "0.875rem",
              }}
              cursor={{ fill: "rgba(29, 158, 117, 0.08)" }}
              formatter={(value: number) => [value, "Calls"]}
              labelFormatter={(_label: string, payload: Array<{ payload?: { date?: string } }>) => {
                if (payload?.[0]?.payload?.date) {
                  return new Date(payload[0].payload.date).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  );
                }
                return _label;
              }}
            />
            <Bar
              dataKey="count"
              fill="#1D9E75"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
