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
  className?: string;
}

const typeDotColor: Record<string, string> = {
  call: "bg-green-500",
  insight: "bg-blue-500",
  escalation: "bg-red-500",
  campaign: "bg-purple-500",
  sync: "bg-amber-500",
};

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4",
        className
      )}
    >
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
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">
                  {activity.hcp_name}
                </span>{" "}
                {activity.message}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {relativeTime(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}
