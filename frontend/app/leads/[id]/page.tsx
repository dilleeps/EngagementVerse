'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLead, useUpdateLead, useDeleteLead, useUpdateLeadStage } from '@/hooks/useLeads';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

function stageBadgeVariant(status?: string): any {
  switch (status?.toUpperCase()) {
    case 'WON': return 'approved';
    case 'LOST': return 'rejected';
    case 'QUALIFIED': return 'active';
    case 'PROPOSAL': case 'NEGOTIATION': return 'scheduled';
    case 'CONTACTED': return 'queued';
    default: return 'draft';
  }
}

function sourceBadgeVariant(source?: string): any {
  switch (source?.toUpperCase()) {
    case 'HUBSPOT': return 'live';
    case 'CSV_IMPORT': return 'scheduled';
    case 'REFERRAL': return 'active';
    default: return 'queued';
  }
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: lead, isLoading } = useLead(id);
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();
  const stageMutation = useUpdateLeadStage();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg bg-white border border-black/[0.08]" />
      </div>
    );
  }

  if (!lead) {
    return <div className="py-12 text-center text-gray-500">Lead not found</div>;
  }

  const name = lead.contact_name ?? lead.contactName ?? 'Unknown';
  const company = lead.company_name ?? lead.companyName ?? '';
  const email = lead.contact_email ?? lead.contactEmail ?? '';
  const phone = lead.contact_phone ?? lead.contactPhone ?? '';
  const status = lead.lead_status ?? lead.leadStatus ?? lead.status ?? 'NEW';
  const source = lead.lead_source ?? lead.leadSource ?? lead.source ?? 'MANUAL';
  const dealValue = lead.deal_value ?? lead.dealValue ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={name} size="lg" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
              <Badge variant={stageBadgeVariant(status)}>{(status ?? '').replace(/_/g, ' ')}</Badge>
              <Badge variant={sourceBadgeVariant(source)}>{(source ?? '').replace(/_/g, ' ')}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">{company}{lead.title ? ` · ${lead.title}` : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { deleteMutation.mutate(id); router.push('/leads'); }}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
          <button onClick={() => router.push('/leads')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Contact information</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{email || '—'}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{phone || '—'}</dd></div>
              <div><dt className="text-gray-500">Title</dt><dd className="font-medium">{lead.title || '—'}</dd></div>
              <div><dt className="text-gray-500">Specialty</dt><dd className="font-medium">{lead.specialty || '—'}</dd></div>
              <div><dt className="text-gray-500">Institution</dt><dd className="font-medium">{lead.institution || '—'}</dd></div>
              <div><dt className="text-gray-500">State</dt><dd className="font-medium">{lead.state || '—'}</dd></div>
            </dl>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notes || 'No notes yet.'}</p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Pipeline stage */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Pipeline stage</h3>
            <select
              value={status}
              onChange={(e) => stageMutation.mutate({ id, status: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          {/* Deal value */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Deal value</h3>
            <p className="text-2xl font-semibold text-gray-900">${Number(dealValue).toLocaleString()}</p>
          </div>

          {/* Dates */}
          <div className="rounded-lg border border-black/[0.08] bg-white p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span>{formatDate(lead.created_at ?? lead.createdAt ?? '')}</span>
            </div>
            {(lead.last_contacted_at ?? lead.lastContactedAt) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Last contacted</span>
                <span>{formatDate(lead.last_contacted_at ?? lead.lastContactedAt)}</span>
              </div>
            )}
            {(lead.next_follow_up_at ?? lead.nextFollowUpAt) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Next follow-up</span>
                <span>{formatDate(lead.next_follow_up_at ?? lead.nextFollowUpAt)}</span>
              </div>
            )}
            {lead.hubspot_id && (
              <div className="flex justify-between">
                <span className="text-gray-500">HubSpot ID</span>
                <span className="font-mono text-xs">{lead.hubspot_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
