import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put } from '@/lib/api';
import type {
  Campaign,
  CampaignFilters,
  PaginatedResponse,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  CampaignAudience,
  UpsertAudiencePayload,
  MLRDocument,
  UploadMLRPayload,
} from '@/types';

// ── List campaigns ──
export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery<PaginatedResponse<Campaign>>({
    queryKey: ['campaigns', filters],
    queryFn: () =>
      get<PaginatedResponse<Campaign>>('/api/v1/campaigns', {
        params: {
          status: filters.status,
          channel: filters.channel,
          page: filters.page,
          size: filters.size,
        },
      }),
  });
}

// ── Single campaign ──
export function useCampaign(id: string) {
  return useQuery<Campaign>({
    queryKey: ['campaigns', id],
    queryFn: () => get<Campaign>(`/api/v1/campaigns/${id}`),
    enabled: !!id,
  });
}

// ── Create campaign ──
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, CreateCampaignPayload>({
    mutationFn: (payload) => post<Campaign>('/api/v1/campaigns', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// ── Update campaign ──
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, UpdateCampaignPayload>({
    mutationFn: ({ id, ...payload }) =>
      put<Campaign>(`/api/v1/campaigns/${id}`, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// ── Launch campaign ──
export function useLaunchCampaign() {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, string>({
    mutationFn: (id) => post<Campaign>(`/api/v1/campaigns/${id}/launch`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// ── Pause campaign ──
export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, string>({
    mutationFn: (id) => post<Campaign>(`/api/v1/campaigns/${id}/pause`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// ── Campaign audience ──
export function useCampaignAudience(id: string) {
  return useQuery<CampaignAudience>({
    queryKey: ['campaigns', id, 'audience'],
    queryFn: () => get<CampaignAudience>(`/api/v1/campaigns/${id}/audience`),
    enabled: !!id,
  });
}

export function useUpsertAudience() {
  const queryClient = useQueryClient();

  return useMutation<CampaignAudience, Error, UpsertAudiencePayload>({
    mutationFn: ({ campaign_id, ...payload }) =>
      post<CampaignAudience>(
        `/api/v1/campaigns/${campaign_id}/audience`,
        payload,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', variables.campaign_id, 'audience'],
      });
      queryClient.invalidateQueries({
        queryKey: ['campaigns', variables.campaign_id],
      });
    },
  });
}

// ── Campaign MLR ──
export function useCampaignMLR(id: string) {
  return useQuery<MLRDocument[]>({
    queryKey: ['campaigns', id, 'mlr'],
    queryFn: () => get<MLRDocument[]>(`/api/v1/campaigns/${id}/mlr`),
    enabled: !!id,
  });
}

export function useUploadMLR() {
  const queryClient = useQueryClient();

  return useMutation<MLRDocument, Error, UploadMLRPayload>({
    mutationFn: ({ campaign_id, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      return post<MLRDocument>(
        `/api/v1/campaigns/${campaign_id}/mlr`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', variables.campaign_id, 'mlr'],
      });
    },
  });
}
