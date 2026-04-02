import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  hcp_name: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const typeDotColor: Record<string, string> = {
  call: "bg-brand",
  insight: "bg-blue-500",
  escalation: "bg-red-500",
  campaign: "bg-purple-500",
  crm: "bg-amber-500",
  note: "bg-gray-400",
};

function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Activity feed
      </h3>

      <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                typeDotColor[activity.type] ?? "bg-gray-400"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700 leading-snug">
                <span className="font-medium text-gray-900">
                  {activity.hcp_name}
                </span>{" "}
                {activity.message}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {getRelativeTime(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            No recent activity.
          </p>
        )}
      </div>
    </div>
  );
}
