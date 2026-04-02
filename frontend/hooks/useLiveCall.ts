import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { wsManager } from '@/lib/websocket';
import { useCallStore } from '@/store/callStore';
import type { Call, TranscriptLine, CallInsight } from '@/types';

export function useLiveCall(id: string) {
  const { transcriptLines, insights, appendLine, appendInsight, reset } =
    useCallStore();

  const {
    data: call,
    isLoading,
  } = useQuery<Call>({
    queryKey: ['calls', id],
    queryFn: () => get<Call>(`/api/v1/calls/${id}`),
    enabled: !!id,
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (!id) return;

    // Reset store for fresh call session
    reset();

    // Connect WebSocket
    wsManager.connect(id);

    const handleTranscript = (payload: unknown) => {
      appendLine(payload as TranscriptLine);
    };

    const handleInsight = (payload: unknown) => {
      appendInsight(payload as CallInsight);
    };

    wsManager.on('transcript', handleTranscript);
    wsManager.on('insight', handleInsight);

    return () => {
      wsManager.off('transcript', handleTranscript);
      wsManager.off('insight', handleInsight);
      wsManager.disconnect();
    };
    // Only re-run when the call id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    call: call ?? null,
    isLoading,
    transcriptLines,
    insights,
  };
}
