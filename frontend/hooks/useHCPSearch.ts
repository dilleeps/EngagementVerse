import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import type { HCP, HCPSearchParams, PaginatedResponse } from '@/types';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useHCPSearch(params: HCPSearchParams = {}) {
  const debouncedQ = useDebounce(params.q, 300);

  const effectiveParams: HCPSearchParams = {
    ...params,
    q: debouncedQ,
  };

  const { data, isLoading } = useQuery<PaginatedResponse<HCP>>({
    queryKey: ['hcp', 'search', effectiveParams],
    queryFn: () =>
      get<PaginatedResponse<HCP>>('/api/v1/hcp', {
        params: {
          q: effectiveParams.q,
          specialty: effectiveParams.specialty,
          kol_tier: effectiveParams.kol_tier,
          state: effectiveParams.state,
          page: effectiveParams.page,
          size: effectiveParams.size,
        },
      }),
  });

  return {
    hcps: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
  };
}
