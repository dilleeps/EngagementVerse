import { create } from 'zustand';
import type { Transcript, AIInsight } from '../../shared/types/index';

interface CallStoreState {
  activeCallId: string | null;
  transcriptLines: Transcript[];
  insights: AIInsight[];
  callStartedAt: string | null;

  setActiveCall: (callId: string, startedAt: string) => void;
  appendLine: (line: Transcript) => void;
  appendInsight: (insight: AIInsight) => void;
  clearCall: () => void;
  reset: () => void;
}

export const useCallStore = create<CallStoreState>((set) => ({
  activeCallId: null,
  transcriptLines: [],
  insights: [],
  callStartedAt: null,

  setActiveCall: (callId, startedAt) =>
    set({
      activeCallId: callId,
      callStartedAt: startedAt,
      transcriptLines: [],
      insights: [],
    }),

  appendLine: (line) =>
    set((state) => ({
      transcriptLines: [...state.transcriptLines, line],
    })),

  appendInsight: (insight) =>
    set((state) => ({
      insights: [...state.insights, insight],
    })),

  clearCall: () =>
    set({
      activeCallId: null,
      transcriptLines: [],
      insights: [],
      callStartedAt: null,
    }),

  reset: () =>
    set({
      activeCallId: null,
      transcriptLines: [],
      insights: [],
      callStartedAt: null,
    }),
}));
