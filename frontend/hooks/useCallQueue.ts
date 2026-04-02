import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import type {
  CallQueueItem,
  Call,
  CallFilters,
  PaginatedResponse,
  EscalatePayload,
  EndCallPayload,
} from '@/types';

export function useCallQueue() {
  return useQuery<CallQueueItem[]>({
    queryKey: ['calls', 'queue'],
    queryFn: () => get<CallQueueItem[]>('/api/v1/calls/queue'),
    refetchInterval: 5_000,
  });
}

export function useCalls(filters: CallFilters = {}) {
  return useQuery<PaginatedResponse<Call>>({
    queryKey: ['calls', filters],
    queryFn: () =>
      get<PaginatedResponse<Call>>('/api/v1/calls', {
        params: {
          status: filters.status,
          campaign_id: filters.campaign_id,
          date_from: filters.date_from,
          date_to: filters.date_to,
          page: filters.page,
          size: filters.size,
        },
      }),
  });
}

export function useEscalateCall() {
  const queryClient = useQueryClient();

  return useMutation<Call, Error, EscalatePayload>({
    mutationFn: ({ call_id, reason }) =>
      post<Call>(`/api/v1/calls/${call_id}/escalate`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useEndCall() {
  const queryClient = useQueryClient();

  return useMutation<Call, Error, EndCallPayload>({
    mutationFn: ({ call_id, disposition }) =>
      post<Call>(`/api/v1/calls/${call_id}/end`, { disposition }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
