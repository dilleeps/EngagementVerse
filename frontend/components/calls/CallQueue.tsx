import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { CallQueueItem } from "@/types";

interface CallQueueProps {
  items: CallQueueItem[];
  className?: string;
}

function formatWaitTime(scheduledAt: string | null): string {
  if (!scheduledAt) return "—";
  const diffMs = Date.now() - new Date(scheduledAt).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
}

function priorityVariant(
  tier: string
): "live" | "escalated" | "queued" {
  if (tier === "TIER_1") return "live";
  if (tier === "TIER_2") return "escalated";
  return "queued";
}

export function CallQueue({ items, className }: CallQueueProps) {
  const sorted = [...items].sort(
    (a, b) => a.priorityOrder - b.priorityOrder
  );

  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Call queue</h3>
      <div className="space-y-2">
        {sorted.map((item, index) => {
          const isNext = index === 0;
          return (
            <Link
              key={item.id}
              href={`/calls/${item.callSessionId}`}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2.5 transition-colors",
                isNext
                  ? "bg-brand-light border border-brand/20"
                  : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  {isNext && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                      Next
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.hcpName}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {item.hcpSpecialty.charAt(0) +
                    item.hcpSpecialty.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={priorityVariant(item.kolTier)}>
                  {item.kolTier.replace("_", " ")}
                </Badge>
                <span className="text-xs text-gray-500 tabular-nums w-12 text-right">
                  {formatWaitTime(item.scheduledAt)}
                </span>
              </div>
            </Link>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            Queue is empty
          </p>
        )}
      </div>
    </div>
  );
}
