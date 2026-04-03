import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

// ── Types ──

export interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  title?: string;
  specialty?: string;
  institution?: string;
  state?: string;
  lead_source: string;
  status: string;
  stage: string;
  deal_value?: number;
  notes?: string;
  tags?: string[];
  assigned_to?: string;
  last_contacted?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  q?: string;
  page?: number;
  size?: number;
}

export interface PaginatedLeads {
  items: Lead[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface LeadStats {
  total: number;
  qualified: number;
  pipeline_value: number;
  won_value: number;
  conversion_rate: number;
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
  errors?: string[];
}

export interface HubSpotImportPayload {
  api_key: string;
}

export interface CreateLeadPayload {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  title?: string;
  specialty?: string;
  institution?: string;
  state?: string;
  lead_source?: string;
  deal_value?: number;
  notes?: string;
  tags?: string[];
}

export interface UpdateLeadPayload extends Partial<CreateLeadPayload> {
  id: string;
}

export interface UpdateLeadStagePayload {
  id: string;
  stage: string;
}

// ── List leads ──
export function useLeads(filters: LeadFilters = {}) {
  return useQuery<PaginatedLeads>({
    queryKey: ['leads', filters],
    queryFn: () =>
      get<PaginatedLeads>('/api/v1/leads', {
        params: {
          status: filters.status,
          source: filters.source,
          q: filters.q,
          page: filters.page,
          size: filters.size,
        },
      }),
  });
}

// ── Single lead ──
export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ['leads', id],
    queryFn: () => get<Lead>(`/api/v1/leads/${id}`),
    enabled: !!id,
  });
}

// ── Create lead ──
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, CreateLeadPayload>({
    mutationFn: (payload) => post<Lead>('/api/v1/leads', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

// ── Update lead ──
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, UpdateLeadPayload>({
    mutationFn: ({ id, ...payload }) =>
      put<Lead>(`/api/v1/leads/${id}`, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

// ── Delete lead ──
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => del<void>(`/api/v1/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

// ── Bulk import (CSV) ──
export function useBulkImportLeads() {
  const queryClient = useQueryClient();

  return useMutation<BulkImportResult, Error, FormData>({
    mutationFn: (formData) =>
      post<BulkImportResult>('/api/v1/leads/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

// ── HubSpot import ──
export function useHubSpotImport() {
  const queryClient = useQueryClient();

  return useMutation<BulkImportResult, Error, HubSpotImportPayload>({
    mutationFn: (payload) =>
      post<BulkImportResult>('/api/v1/leads/hubspot-import', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

// ── Lead stats ──
export function useLeadStats() {
  return useQuery<LeadStats>({
    queryKey: ['lead-stats'],
    queryFn: () => get<LeadStats>('/api/v1/leads/stats'),
  });
}

// ── Update lead stage ──
export function useUpdateLeadStage() {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, UpdateLeadStagePayload>({
    mutationFn: ({ id, stage }) =>
      put<Lead>(`/api/v1/leads/${id}/stage`, { stage }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}
