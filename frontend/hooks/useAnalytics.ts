import { useQuery, useMutation } from '@tanstack/react-query';
import { get } from '@/lib/api';
import type {
  AnalyticsSummary,
  OutcomeData,
  ChannelMixData,
  CampaignPerformance,
} from '@/types';

export function useAnalyticsSummary() {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: () => get<AnalyticsSummary>('/api/v1/analytics/summary'),
  });
}

export function useOutcomes() {
  return useQuery<OutcomeData[]>({
    queryKey: ['analytics', 'outcomes'],
    queryFn: () => get<OutcomeData[]>('/api/v1/analytics/outcomes'),
  });
}

export function useChannelMix() {
  return useQuery<ChannelMixData[]>({
    queryKey: ['analytics', 'channel-mix'],
    queryFn: () => get<ChannelMixData[]>('/api/v1/analytics/channel-mix'),
  });
}

export function useCampaignPerformance() {
  return useQuery<CampaignPerformance[]>({
    queryKey: ['analytics', 'campaigns'],
    queryFn: () =>
      get<CampaignPerformance[]>('/api/v1/analytics/campaigns'),
  });
}

export function useExportCSV() {
  return useMutation<{ url: string }, Error, void>({
    mutationFn: () => get<{ url: string }>('/api/v1/analytics/export'),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        window.open(data.url, '_blank');
      }
    },
  });
}
