'use client';

import type { Lead } from '@/hooks/useLeads';

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

const SOURCE_COLORS: Record<string, string> = {
  HUBSPOT: 'border-l-orange-400',
  MANUAL: 'border-l-gray-400',
  CSV: 'border-l-blue-400',
};

function getSourceColor(source?: string): string {
  return SOURCE_COLORS[(source ?? '').toUpperCase()] ?? 'border-l-gray-300';
}

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
    month: 'short',
    day: 'numeric',
  });
}

interface LeadPipelineProps {
  leads: Lead[];
  onStageChange: (leadId: string, newStage: string) => void;
}

export function LeadPipeline({ leads, onStageChange }: LeadPipelineProps) {
  const grouped: Record<string, Lead[]> = {};
  for (const stage of STAGES) {
    grouped[stage] = [];
  }
  for (const lead of leads ?? []) {
    const stage = (lead.stage ?? lead.status ?? 'NEW').toUpperCase();
    if (grouped[stage]) {
      grouped[stage].push(lead);
    } else {
      grouped['NEW'].push(lead);
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageLeads = grouped[stage];
        return (
          <div
            key={stage}
            className="flex w-64 min-w-[16rem] flex-shrink-0 flex-col"
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2">
              <span className="text-xs font-semibold text-gray-700">
                {STAGE_LABELS[stage]}
              </span>
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[10px] font-bold text-gray-600">
                {stageLeads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2">
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('leadId', lead.id);
                  }}
                  className={`cursor-grab rounded-lg border border-black/[0.08] border-l-4 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${getSourceColor(lead.lead_source)}`}
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {lead.contact_name ?? lead.company_name ?? 'Unknown'}
                  </p>
                  {(lead.company_name ?? lead.contact_name) && (
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {lead.company_name}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand">
                      {formatCurrency(lead.deal_value)}
                    </span>
                  </div>
                  {(lead.assigned_to || lead.last_contacted) && (
                    <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                      <span className="truncate">
                        {lead.assigned_to ?? ''}
                      </span>
                      <span>{formatDate(lead.last_contacted)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const leadId = e.dataTransfer.getData('leadId');
                if (leadId) {
                  onStageChange(leadId, stage);
                }
              }}
              className="mt-2 flex h-10 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-[10px] text-gray-400"
            >
              Drop here
            </div>
          </div>
        );
      })}
    </div>
  );
}
