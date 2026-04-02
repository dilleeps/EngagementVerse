import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  prefix,
  suffix,
  className,
}: MetricCardProps) {
  const isPositive = delta >= 0;

  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4 transition-colors hover:bg-brand-light group",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">
            {prefix}
            {typeof value === "number" ? value.toLocaleString("en-US") : value}
            {suffix}
          </p>
          <p className="mt-1 text-sm text-gray-500">{label}</p>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
            isPositive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          )}
        >
          {isPositive ? (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l7.5-7.5 7.5 7.5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12l7.5-7.5L19.5 12"
              />
            </svg>
          ) : (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 4.5l-7.5 7.5-7.5-7.5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12l-7.5 7.5L4.5 12"
              />
            </svg>
          )}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
