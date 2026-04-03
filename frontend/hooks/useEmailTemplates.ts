import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

// ── Types ──

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables?: string[];
  is_active: boolean;
  preview_text?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface EmailTemplateFilters {
  category?: string;
  is_active?: boolean;
  q?: string;
  page?: number;
  size?: number;
}

export interface PaginatedTemplates {
  items: EmailTemplate[];
  total: number;
  page: number;
  size: number;
}

export interface CreateTemplatePayload {
  name: string;
  subject: string;
  body: string;
  category?: string;
  variables?: string[];
  is_active?: boolean;
  preview_text?: string;
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {
  id: string;
}

export interface TemplatePreviewRequest {
  variable_values: Record<string, string>;
}

export interface TemplatePreviewResponse {
  rendered_subject: string;
  rendered_body: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

// ── List templates ──
export function useEmailTemplates(filters: EmailTemplateFilters = {}) {
  return useQuery<PaginatedTemplates>({
    queryKey: ['email-templates', filters],
    queryFn: () =>
      get<PaginatedTemplates>('/api/v1/email-templates', {
        params: {
          category: filters.category,
          is_active: filters.is_active,
          q: filters.q,
          page: filters.page,
          size: filters.size,
        },
      }),
  });
}

// ── Single template ──
export function useEmailTemplate(id: string) {
  return useQuery<EmailTemplate>({
    queryKey: ['email-templates', id],
    queryFn: () => get<EmailTemplate>(`/api/v1/email-templates/${id}`),
    enabled: !!id,
  });
}

// ── Create template ──
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<EmailTemplate, Error, CreateTemplatePayload>({
    mutationFn: (payload) => post<EmailTemplate>('/api/v1/email-templates', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
  });
}

// ── Update template ──
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<EmailTemplate, Error, UpdateTemplatePayload>({
    mutationFn: ({ id, ...payload }) =>
      put<EmailTemplate>(`/api/v1/email-templates/${id}`, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
  });
}

// ── Delete template ──
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => del<void>(`/api/v1/email-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
  });
}

// ── Preview template ──
export function usePreviewTemplate() {
  return useMutation<TemplatePreviewResponse, Error, { id: string; variable_values: Record<string, string> }>({
    mutationFn: ({ id, variable_values }) =>
      post<TemplatePreviewResponse>(`/api/v1/email-templates/${id}/preview`, {
        variable_values,
      }),
  });
}

// ── Duplicate template ──
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<EmailTemplate, Error, string>({
    mutationFn: (id) =>
      post<EmailTemplate>(`/api/v1/email-templates/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
  });
}

// ── Template categories ──
export function useTemplateCategories() {
  return useQuery<CategoryCount[]>({
    queryKey: ['template-categories'],
    queryFn: () => get<CategoryCount[]>('/api/v1/email-templates/categories'),
  });
}
