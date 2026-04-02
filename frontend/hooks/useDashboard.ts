import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import type { DashboardSummary } from '@/types';

export function useDashboard() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard'],
    queryFn: () => get<DashboardSummary>('/api/v1/dashboard/summary'),
    refetchInterval: 30_000,
  });
}
