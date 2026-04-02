import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { CallQueueItem } from "@/types";

interface CallQueueProps {
  items: CallQueueItem[];
}

function formatWaitTime(scheduledAt: string | null): string {
  if (!scheduledAt) return "--";
  const diffMs = Date.now() - new Date(scheduledAt).getTime();
  if (diffMs < 0) return "0m";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function priorityVariant(
  tier: string
): "live" | "escalated" | "scheduled" | "queued" {
  switch (tier) {
    case "TIER_1":
      return "live";
    case "TIER_2":
      return "escalated";
    case "TIER_3":
      return "scheduled";
    default:
      return "queued";
  }
}

export function CallQueue({ items }: CallQueueProps) {
  const sorted = [...items].sort(
    (a, b) => a.priorityOrder - b.priorityOrder
  );

  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Call queue</h3>

      <div className="space-y-2">
        {sorted.map((item, idx) => {
          const isNext = idx === 0;

          return (
            <Link
              key={item.id}
              href={`/calls/${item.callSessionId}`}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors",
                isNext
                  ? "border-brand/30 bg-brand-light/50 hover:bg-brand-light"
                  : "border-transparent hover:bg-gray-50"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {isNext && (
                    <span className="inline-flex items-center rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      Next
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.hcpName}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500 capitalize">
                  {item.hcpSpecialty.toLowerCase()}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                <Badge variant={priorityVariant(item.kolTier)}>
                  {item.kolTier.replace("_", " ")}
                </Badge>
                <span className="text-xs tabular-nums text-gray-500 w-12 text-right">
                  {formatWaitTime(item.scheduledAt)}
                </span>
              </div>
            </Link>
          );
        })}

        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            Queue is empty.
          </p>
        )}
      </div>
    </div>
  );
}
