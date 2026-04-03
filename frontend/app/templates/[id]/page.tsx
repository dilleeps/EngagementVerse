'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useEmailTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  type CreateTemplatePayload,
} from '@/hooks/useEmailTemplates';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { TemplatePreview } from '@/components/templates/TemplatePreview';

const CATEGORY_COLORS: Record<string, string> = {
  OUTREACH: 'bg-blue-100 text-blue-800',
  FOLLOW_UP: 'bg-yellow-100 text-yellow-800',
  DRUG_UPDATE: 'bg-purple-100 text-purple-800',
  SAFETY_ALERT: 'bg-red-100 text-red-700',
  CONFERENCE: 'bg-orange-100 text-orange-800',
  GENERAL: 'bg-gray-100 text-gray-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  OUTREACH: 'Outreach',
  FOLLOW_UP: 'Follow-up',
  DRUG_UPDATE: 'Drug Update',
  SAFETY_ALERT: 'Safety Alert',
  CONFERENCE: 'Conference',
  GENERAL: 'General',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: template, isLoading } = useEmailTemplate(id);
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();

  const [showEdit, setShowEdit] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="py-20 text-center text-gray-400">Template not found</div>
    );
  }

  const categoryKey = (template.category ?? 'GENERAL').toUpperCase();
  const categoryClass = CATEGORY_COLORS[categoryKey] ?? 'bg-gray-100 text-gray-700';
  const categoryLabel = CATEGORY_LABELS[categoryKey] ?? categoryKey;

  const handleUpdate = (data: CreateTemplatePayload) => {
    updateTemplate.mutate(
      { id: template.id, ...data },
      { onSuccess: () => setShowEdit(false) },
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Delete template "${template.name}"?`)) {
      deleteTemplate.mutate(template.id, {
        onSuccess: () => router.push('/templates'),
      });
    }
  };

  const handleDuplicate = () => {
    duplicateTemplate.mutate(template.id, {
      onSuccess: (newTemplate) => {
        router.push(`/templates/${newTemplate.id}`);
      },
    });
  };

  if (showEdit) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setShowEdit(false)}
          className="text-sm text-brand hover:text-brand-dark transition-colors"
        >
          &larr; Back to template
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Edit template</h1>

        <div className="rounded-lg border border-black/[0.08] bg-white p-6">
          <TemplateEditor
            template={template}
            onSubmit={handleUpdate}
            onCancel={() => setShowEdit(false)}
            isSubmitting={updateTemplate.isPending}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push('/templates')}
        className="text-sm text-brand hover:text-brand-dark transition-colors"
      >
        &larr; Back to templates
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryClass}`}
            >
              {categoryLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                template.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  template.is_active ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            disabled={duplicateTemplate.isPending}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {duplicateTemplate.isPending ? 'Duplicating...' : 'Duplicate'}
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTemplate.isPending}
            className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Preview */}
        <div className="lg:col-span-2">
          <TemplatePreview
            subject={template.subject}
            body={template.body}
            previewText={template.preview_text}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Variables
            </h2>
            {(template.variables?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {template.variables?.map((v) => (
                  <span
                    key={v}
                    className="inline-flex rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand font-mono"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No variables defined</p>
            )}
          </div>

          {/* Details */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Details
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900">{categoryLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="text-gray-900">
                  {template.is_active ? 'Active' : 'Inactive'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Variables</dt>
                <dd className="text-gray-900">
                  {template.variables?.length ?? 0}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">
                  {formatDate(template.created_at)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Updated</dt>
                <dd className="text-gray-900">
                  {formatDate(template.updated_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Usage stats placeholder */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Usage stats
            </h2>
            <div className="py-4 text-center text-sm text-gray-400">
              Usage tracking coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
