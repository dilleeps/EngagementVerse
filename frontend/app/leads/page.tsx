'use client';

import { useState } from 'react';
import { useLeads, useLeadStats, useDeleteLead, useUpdateLeadStage, useHubSpotImport } from '@/hooks/useLeads';
import { LeadPipeline } from '@/components/leads/LeadPipeline';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadForm } from '@/components/leads/LeadForm';
import { MetricGrid } from '@/components/ui/MetricGrid';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All sources' },
  { value: 'HUBSPOT', label: 'HubSpot' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'CSV_IMPORT', label: 'CSV Import' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'CONFERENCE', label: 'Conference' },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

export default function LeadsPage() {
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const [filters, setFilters] = useState({ status: '', source: '', q: '', page: 1, size: 50 });
  const [showForm, setShowForm] = useState(false);
  const [showHubSpot, setShowHubSpot] = useState(false);
  const [hubSpotKey, setHubSpotKey] = useState('');

  const { data: leadsData, isLoading } = useLeads(filters);
  const { data: stats } = useLeadStats();
  const deleteMutation = useDeleteLead();
  const stageMutation = useUpdateLeadStage();
  const hubSpotMutation = useHubSpotImport();

  const leads: any[] = Array.isArray(leadsData) ? leadsData : (leadsData?.items ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Leads & sales</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHubSpot(true)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Import from HubSpot
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            New lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <MetricGrid>
        <StatCard label="Total leads" value={stats?.total_leads ?? stats?.totalLeads ?? 0} />
        <StatCard label="Qualified" value={stats?.qualified ?? 0} />
        <StatCard label="Pipeline value" value={`$${((stats?.pipeline_value ?? stats?.pipelineValue ?? 0) / 1000).toFixed(0)}K`} />
        <StatCard label="Won" value={stats?.won ?? 0} />
      </MetricGrid>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-end gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filters.source}
          onChange={(e) => setFilters(f => ({ ...f, source: e.target.value, page: 1 }))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="text"
          value={filters.q}
          onChange={(e) => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
          placeholder="Search leads..."
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400"
        />
        <div className="ml-auto flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => setView('pipeline')}
            className={`px-3 py-2 text-sm font-medium ${view === 'pipeline' ? 'bg-brand text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-2 text-sm font-medium ${view === 'table' ? 'bg-brand text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      ) : leads.length === 0 ? (
        <EmptyState title="No leads yet" description="Create your first lead or import from HubSpot." />
      ) : view === 'pipeline' ? (
        <LeadPipeline
          leads={leads}
          onStageChange={(id, stage) => stageMutation.mutate({ id, status: stage })}
        />
      ) : (
        <LeadTable
          leads={leads}
          onEdit={() => {}}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}

      {/* New Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">New lead</h2>
            <LeadForm onSubmit={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* HubSpot Import Dialog */}
      {showHubSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Import from HubSpot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HubSpot API key</label>
                <input
                  type="password"
                  value={hubSpotKey}
                  onChange={(e) => setHubSpotKey(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="pat-na1-..."
                />
              </div>
              {hubSpotMutation.isSuccess && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  Imported {(hubSpotMutation.data as any)?.imported ?? 0} contacts
                </div>
              )}
              {hubSpotMutation.isError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  Import failed. Check your API key.
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => { setShowHubSpot(false); hubSpotMutation.reset(); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
                <button
                  onClick={() => hubSpotMutation.mutate({ api_key: hubSpotKey })}
                  disabled={!hubSpotKey || hubSpotMutation.isPending}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  {hubSpotMutation.isPending ? 'Importing...' : 'Import contacts'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
