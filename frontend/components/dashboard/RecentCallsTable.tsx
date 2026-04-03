import Link from "next/link";
import { cn, formatDuration, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface RecentCallsTableProps {
  calls: any[];
  className?: string;
}

function getBadgeVariant(status?: string): "live" | "completed" | "escalated" | "scheduled" | "queued" | "opted_out" | "draft" {
  switch (status?.toUpperCase()) {
    case 'LIVE': return 'live';
    case 'COMPLETED': return 'completed';
    case 'ESCALATED': return 'escalated';
    case 'NO_ANSWER': return 'scheduled';
    case 'QUEUED': return 'queued';
    case 'OPTED_OUT': return 'opted_out';
    default: return 'draft';
  }
}

function statusLabel(status?: string): string {
  if (!status) return 'Unknown';
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
}

export function RecentCallsTable({ calls, className }: RecentCallsTableProps) {
  return (
    <div className={cn("border border-black/[0.08] rounded-lg bg-white p-4", className)}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent calls</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
              <th className="pb-3 pr-4">HCP</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Duration</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {calls.map((call: any, idx: number) => {
              const hcpName = call.hcp_name ?? call.hcpName ?? (call.hcp ? `${call.hcp.first_name ?? call.hcp.firstName ?? ''} ${call.hcp.last_name ?? call.hcp.lastName ?? ''}`.trim() : `Call ${idx + 1}`);
              const duration = call.duration_seconds ?? call.durationSeconds ?? 0;
              const date = call.started_at ?? call.startedAt ?? call.created_at ?? call.createdAt ?? '';

              return (
                <tr key={call.id ?? idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4">
                    <Link href={`/calls/${call.id ?? ''}`} className="flex items-center gap-2.5">
                      <Avatar name={hcpName || 'HCP'} size="sm" />
                      <span className="font-medium text-gray-900">{hcpName || 'Unknown'}</span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={getBadgeVariant(call.status)}>
                      {statusLabel(call.status)}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 tabular-nums">
                    {duration > 0 ? formatDuration(duration) : '—'}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">
                    {date ? formatDate(date) : '—'}
                  </td>
                  <td className="py-3">
                    <Link href={`/calls/${call.id ?? ''}`} className="text-xs text-brand hover:text-brand-dark font-medium transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {calls.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">No recent calls</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
