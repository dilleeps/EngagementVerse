import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

interface CRMSyncStatusProps {
  syncedAt: string | null;
  recordId: string | null;
  className?: string;
}

export function CRMSyncStatus({
  syncedAt,
  recordId,
  className,
}: CRMSyncStatusProps) {
  const isSynced = syncedAt !== null;

  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        CRM Sync Status
      </h3>

      <div className="flex items-center gap-2.5">
        {isSynced ? (
          <>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-4 w-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </span>
            <span className="text-sm font-medium text-green-700">Synced</span>
          </>
        ) : (
          <>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-4 w-4 text-amber-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </span>
            <span className="text-sm font-medium text-amber-700">
              Pending sync
            </span>
          </>
        )}
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Last synced</dt>
          <dd className="text-gray-700 font-medium">
            {syncedAt ? formatDateTime(syncedAt) : "--"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">CRM Record</dt>
          <dd>
            {recordId ? (
              <a
                href={`#crm-record-${recordId}`}
                className="text-brand font-medium hover:underline"
              >
                {recordId}
              </a>
            ) : (
              <span className="text-gray-400">--</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
