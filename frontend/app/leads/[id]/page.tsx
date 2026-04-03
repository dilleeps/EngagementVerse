'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useLead,
  useUpdateLead,
  useDeleteLead,
  useUpdateLeadStage,
  type CreateLeadPayload,
} from '@/hooks/useLeads';
import { LeadForm } from '@/components/leads/LeadForm';

const STAGES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
] as const;

const STAGE_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  PROPOSAL: 'bg-purple-100 text-purple-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  WON: 'bg-emerald-100 text-emerald-800',
  LOST: 'bg-red-100 text-red-700',
};

const SOURCE_COLORS: Record<string, string> = {
  HUBSPOT: 'bg-orange-100 text-orange-800',
  MANUAL: 'bg-gray-100 text-gray-700',
  CSV: 'bg-blue-100 text-blue-800',
  REFERRAL: 'bg-purple-100 text-purple-800',
  WEBSITE: 'bg-teal-100 text-teal-800',
};

function formatCurrency(value?: number): string {
  if (value == null) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const updateStage = useUpdateLeadStage();

  const [showEdit, setShowEdit] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-20 text-center text-gray-400">Lead not found</div>
    );
  }

  const statusKey = (lead.stage ?? lead.status ?? 'NEW').toUpperCase();
  const statusClass = STATUS_COLORS[statusKey] ?? 'bg-gray-100 text-gray-700';
  const sourceKey = (lead.lead_source ?? '').toUpperCase();
  const sourceClass = SOURCE_COLORS[sourceKey] ?? 'bg-gray-100 text-gray-700';

  const handleUpdate = (data: CreateLeadPayload) => {
    updateLead.mutate(
      { id: lead.id, ...data },
      { onSuccess: () => setShowEdit(false) },
    );
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete lead "${lead.contact_name ?? lead.company_name}"?`,
      )
    ) {
      deleteLead.mutate(lead.id, {
        onSuccess: () => router.push('/leads'),
      });
    }
  };

  const handleStageChange = (newStage: string) => {
    updateStage.mutate({ id: lead.id, stage: newStage });
  };

  const infoRows: { label: string; value: string }[] = [
    { label: 'Email', value: lead.contact_email ?? '--' },
    { label: 'Phone', value: lead.contact_phone ?? '--' },
    { label: 'Title', value: lead.title ?? '--' },
    { label: 'Specialty', value: lead.specialty ?? '--' },
    { label: 'Institution', value: lead.institution ?? '--' },
    { label: 'State', value: lead.state ?? '--' },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push('/leads')}
        className="text-sm text-brand hover:text-brand-dark transition-colors"
      >
        &larr; Back to leads
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lead.contact_name ?? 'Unknown'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {lead.company_name ?? '--'}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
            >
              {lead.stage ?? lead.status ?? 'NEW'}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${sourceClass}`}
            >
              {lead.lead_source ?? '--'}
            </span>
            {lead.deal_value != null && (
              <span className="text-sm font-semibold text-brand">
                {formatCurrency(lead.deal_value)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Contact information
            </h2>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {infoRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-medium text-gray-500">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {lead.notes ?? 'No notes yet.'}
            </p>
          </div>

          {/* Activity Timeline placeholder */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Activity
            </h2>
            <div className="py-6 text-center text-sm text-gray-400">
              Activity timeline coming soon
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pipeline Stage Selector */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Pipeline stage
            </h2>
            <select
              value={(lead.stage ?? lead.status ?? 'NEW').toUpperCase()}
              onChange={(e) => handleStageChange(e.target.value)}
              disabled={updateStage.isPending}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
          </div>

          {/* Meta */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Details
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Assigned to</dt>
                <dd className="text-gray-900">
                  {lead.assigned_to ?? '--'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last contacted</dt>
                <dd className="text-gray-900">
                  {formatDate(lead.last_contacted)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">
                  {formatDate(lead.created_at)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Updated</dt>
                <dd className="text-gray-900">
                  {formatDate(lead.updated_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Tags */}
          {(lead.tags?.length ?? 0) > 0 && (
            <div className="rounded-lg border border-black/[0.08] bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEdit(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-black/[0.08] bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Edit lead
            </h2>
            <LeadForm
              lead={lead}
              onSubmit={handleUpdate}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
