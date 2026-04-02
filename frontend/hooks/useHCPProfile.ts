import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import type { HCPProfile, PrescribingData, EngagementHistory } from '@/types';

export function useHCPProfile(id: string) {
  const profileQuery = useQuery<HCPProfile>({
    queryKey: ['hcp', id, 'profile'],
    queryFn: () => get<HCPProfile>(`/api/v1/hcp/${id}`),
    enabled: !!id,
  });

  const prescribingQuery = useQuery<PrescribingData>({
    queryKey: ['hcp', id, 'prescribing'],
    queryFn: () => get<PrescribingData>(`/api/v1/hcp/${id}/prescribing`),
    enabled: !!id,
  });

  const engagementQuery = useQuery<EngagementHistory>({
    queryKey: ['hcp', id, 'engagement'],
    queryFn: () => get<EngagementHistory>(`/api/v1/hcp/${id}/engagement`),
    enabled: !!id,
  });

  return {
    profile: profileQuery.data ?? null,
    prescribing: prescribingQuery.data ?? null,
    engagement: engagementQuery.data ?? null,
    isLoading:
      profileQuery.isLoading ||
      prescribingQuery.isLoading ||
      engagementQuery.isLoading,
  };
}
