import Link from "next/link";
import { cn, formatDuration, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { CallSession, CallStatus } from "@/types";

interface RecentCallsTableProps {
  calls: CallSession[];
}

const statusToBadgeVariant: Record<CallStatus, "live" | "completed" | "escalated" | "scheduled" | "queued" | "opted_out"> = {
  LIVE: "live",
  COMPLETED: "completed",
  ESCALATED: "escalated",
  QUEUED: "queued",
  NO_ANSWER: "completed",
  OPTED_OUT: "opted_out",
};

function statusLabel(status: CallStatus): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function RecentCallsTable({ calls }: RecentCallsTableProps) {
  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent calls</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="pb-3 font-medium text-gray-500">HCP</th>
              <th className="pb-3 font-medium text-gray-500">Specialty</th>
              <th className="pb-3 font-medium text-gray-500">Status</th>
              <th className="pb-3 font-medium text-gray-500">Duration</th>
              <th className="pb-3 font-medium text-gray-500">Date</th>
              <th className="pb-3 font-medium text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {calls.map((call) => {
              const hcpName = call.hcp
                ? `${call.hcp.firstName} ${call.hcp.lastName}`
                : "Unknown HCP";
              const specialty = call.hcp?.specialty ?? "OTHER";

              return (
                <tr
                  key={call.id}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/calls/${call.id}`}
                      className="flex items-center gap-2.5"
                    >
                      <Avatar name={hcpName} size="sm" />
                      <span className="font-medium text-gray-900 group-hover:text-brand">
                        {hcpName}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 capitalize">
                    {specialty.toLowerCase()}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusToBadgeVariant[call.status]}>
                      {statusLabel(call.status)}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 tabular-nums">
                    {call.durationSeconds != null
                      ? formatDuration(call.durationSeconds)
                      : "--:--"}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {formatDate(call.createdAt)}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/calls/${call.id}`}
                      className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
                        "text-brand hover:bg-brand-light transition-colors"
                      )}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {calls.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          No recent calls to display.
        </p>
      )}
    </div>
  );
}
