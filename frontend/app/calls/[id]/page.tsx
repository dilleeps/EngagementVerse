'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveCall } from '@/hooks/useLiveCall';
import { useCallStore } from '@/store/callStore';
import { useEscalateCall, useEndCall, useCallQueue } from '@/hooks/useCallQueue';
import { LiveCallCard } from '@/components/calls/LiveCallCard';
import { TranscriptPane } from '@/components/calls/TranscriptPane';
import { CallControls } from '@/components/calls/CallControls';
import { AIInsightsPanel } from '@/components/calls/AIInsightsPanel';
import { CRMSyncStatus } from '@/components/calls/CRMSyncStatus';
import { CallQueue } from '@/components/calls/CallQueue';

export default function LiveCallPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { call, isLoading, transcriptLines, insights } = useLiveCall(id);
  const { activeCallId } = useCallStore();
  const escalateMutation = useEscalateCall();
  const endCallMutation = useEndCall();
  const { data: queueItems } = useCallQueue();

  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  const handleEscalate = async () => {
    if (!id) return;
    await escalateMutation.mutateAsync({
      call_id: id,
      reason: escalateReason || 'Transfer to MSL requested',
    });
    setShowEscalateDialog(false);
    setEscalateReason('');
    router.push('/calls');
  };

  const handleEndCall = async () => {
    if (!id) return;
    await endCallMutation.mutateAsync({
      call_id: id,
      disposition: 'COMPLETED',
    });
    setShowEndDialog(false);
    router.push('/calls');
  };

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div className="h-32 animate-pulse rounded-lg border border-black/[0.08] bg-white" />
          <div className="h-96 animate-pulse rounded-lg border border-black/[0.08] bg-white" />
          <div className="h-16 animate-pulse rounded-lg border border-black/[0.08] bg-white" />
        </div>
        <div className="w-72 space-y-4">
          <div className="h-64 animate-pulse rounded-lg border border-black/[0.08] bg-white" />
          <div className="h-32 animate-pulse rounded-lg border border-black/[0.08] bg-white" />
          <div className="h-48 animate-pulse rounded-lg border border-black/[0.08] bg-white" />
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Call not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            This call session may have ended or does not exist.
          </p>
          <button
            onClick={() => router.push('/calls')}
            className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            Back to calls
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-6">
        {/* Left column: main call area */}
        <div className="flex-1 space-y-4">
          <LiveCallCard call={call} />

          <TranscriptPane lines={transcriptLines} />

          <CallControls
            callId={id}
            status={call.status}
            onEscalate={() => setShowEscalateDialog(true)}
            onEnd={() => setShowEndDialog(true)}
            isEscalating={escalateMutation.isPending}
            isEnding={endCallMutation.isPending}
          />
        </div>

        {/* Right sidebar */}
        <div className="w-72 shrink-0 space-y-4">
          <AIInsightsPanel insights={insights} />

          <CRMSyncStatus callId={id} />

          {queueItems && queueItems.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                Up next
              </h3>
              <CallQueue items={queueItems.slice(0, 3)} compact />
            </div>
          )}
        </div>
      </div>

      {/* Escalate confirmation dialog */}
      {showEscalateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Transfer to MSL
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This will escalate the call to a Medical Science Liaison. Please
              provide a reason.
            </p>
            <textarea
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Reason for escalation..."
              rows={3}
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowEscalateDialog(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={escalateMutation.isPending}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {escalateMutation.isPending ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End call confirmation dialog */}
      {showEndDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">End call</h3>
            <p className="mt-1 text-sm text-gray-500">
              Are you sure you want to end this call? This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowEndDialog(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndCall}
                disabled={endCallMutation.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {endCallMutation.isPending ? 'Ending...' : 'End call'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
