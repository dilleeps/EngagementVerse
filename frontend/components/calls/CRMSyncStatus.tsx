import { cn, formatDateTime } from "@/lib/utils";

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
        CRM sync status
      </h3>
      <div className="flex items-center gap-3">
        {isSynced ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
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
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {isSynced ? "Synced" : "Pending sync"}
          </p>
          {isSynced && syncedAt && (
            <p className="text-xs text-gray-500">
              Last synced {formatDateTime(syncedAt)}
            </p>
          )}
        </div>
      </div>

      {recordId && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">CRM Record</p>
          <a
            href={`#crm-record-${recordId}`}
            className="text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            {recordId}
          </a>
        </div>
      )}
    </div>
  );
}
