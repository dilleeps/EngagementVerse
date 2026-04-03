import Link from "next/link";
import { cn, formatDuration, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { CallSession, CallStatus } from "@/types";

interface RecentCallsTableProps {
  calls: CallSession[];
  className?: string;
}

const statusToBadgeVariant: Record<
  CallStatus,
  "live" | "completed" | "escalated" | "scheduled" | "queued" | "opted_out"
> = {
  LIVE: "live",
  COMPLETED: "completed",
  ESCALATED: "escalated",
  NO_ANSWER: "scheduled",
  QUEUED: "queued",
  OPTED_OUT: "opted_out",
};

function statusLabel(status: CallStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ");
}

export function RecentCallsTable({ calls, className }: RecentCallsTableProps) {
  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent calls</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="pb-3 pr-4">HCP</th>
              <th className="pb-3 pr-4">Specialty</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Duration</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => {
              const hcpName = call.hcp
                ? `${call.hcp.firstName} ${call.hcp.lastName}`
                : call.hcpId;
              const specialty = call.hcp?.specialty ?? "—";

              return (
                <tr
                  key={call.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/calls/${call.id}`}
                      className="flex items-center gap-2.5"
                    >
                      <Avatar name={hcpName} size="sm" />
                      <span className="font-medium text-gray-900">
                        {hcpName}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {specialty === "—"
                      ? specialty
                      : specialty.charAt(0) + specialty.slice(1).toLowerCase()}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusToBadgeVariant[call.status]}>
                      {statusLabel(call.status)}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 tabular-nums">
                    {call.durationSeconds != null
                      ? formatDuration(call.durationSeconds)
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {formatDate(call.createdAt)}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/calls/${call.id}`}
                      className="text-brand hover:text-brand-dark font-medium text-xs"
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
    </div>
  );
}
