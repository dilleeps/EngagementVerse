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
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">
        {prefix}
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
        {suffix}
      </p>
      <div className="mt-2 flex items-center gap-1">
        {isPositive ? (
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
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
            className="h-4 w-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
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
        <span
          className={cn(
            "text-sm font-medium",
            isPositive ? "text-green-600" : "text-red-600"
          )}
        >
          {isPositive ? "+" : ""}
          {delta.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
