'use client';

import { useState, useRef } from 'react';
import {
  useLeads,
  useLeadStats,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useBulkImportLeads,
  useHubSpotImport,
  useUpdateLeadStage,
  type Lead,
  type CreateLeadPayload,
  type LeadFilters,
} from '@/hooks/useLeads';
import { LeadPipeline } from '@/components/leads/LeadPipeline';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadForm } from '@/components/leads/LeadForm';
import { LeadStatsCards } from '@/components/leads/LeadStatsCards';
import { HubSpotImportDialog } from '@/components/leads/HubSpotImportDialog';

type ViewMode = 'pipeline' | 'table';

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
  { value: 'MANUAL', label: 'Manual' },
  { value: 'HUBSPOT', label: 'HubSpot' },
  { value: 'CSV', label: 'CSV' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'WEBSITE', label: 'Website' },
];

export default function LeadsPage() {
  const [view, setView] = useState<ViewMode>('pipeline');
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    size: 100,
  });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showHubSpot, setShowHubSpot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFilters: LeadFilters = {
    ...filters,
    q: search || undefined,
  };

  const { data: leadsData, isLoading } = useLeads(activeFilters);
  const { data: stats } = useLeadStats();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkImport = useBulkImportLeads();
  const hubspotImport = useHubSpotImport();
  const updateStage = useUpdateLeadStage();

  const leads = leadsData?.items ?? [];

  const handleCreateOrUpdate = (data: CreateLeadPayload) => {
    if (editingLead) {
      updateLead.mutate(
        { id: editingLead.id, ...data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingLead(null);
          },
        },
      );
    } else {
      createLead.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
        },
      });
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleDelete = (lead: Lead) => {
    if (window.confirm(`Delete lead "${lead.contact_name ?? lead.company_name}"?`)) {
      deleteLead.mutate(lead.id);
    }
  };

  const handleStageChange = (leadId: string, newStage: string) => {
    updateStage.mutate({ id: leadId, stage: newStage });
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    bulkImport.mutate(formData);
    setShowImportMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleHubSpotImport = (apiKey: string) => {
    hubspotImport.mutate({ api_key: apiKey });
  };

  const selectClass =
    'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads &amp; sales</h1>
        <div className="flex items-center gap-2">
          {/* Import dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowImportMenu((p) => !p)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Import
            </button>
            {showImportMenu && (
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-black/[0.08] bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowImportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Upload CSV
                </button>
                <button
                  onClick={() => {
                    setShowHubSpot(true);
                    setShowImportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  HubSpot import
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
          </div>

          {/* New lead */}
          <button
            onClick={() => {
              setEditingLead(null);
              setShowForm(true);
            }}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            New lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <LeadStatsCards stats={stats} />

      {/* Filters & View toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: e.target.value || undefined,
              page: 1,
            }))
          }
          className={selectClass}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filters.source ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              source: e.target.value || undefined,
              page: 1,
            }))
          }
          className={selectClass}
        >
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand w-60"
        />

        <div className="ml-auto flex rounded-md border border-gray-300 overflow-hidden">
          <button
            onClick={() => setView('pipeline')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              view === 'pipeline'
                ? 'bg-brand text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              view === 'table'
                ? 'bg-brand text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      ) : view === 'pipeline' ? (
        <LeadPipeline leads={leads} onStageChange={handleStageChange} />
      ) : (
        <LeadTable leads={leads} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Lead Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowForm(false);
              setEditingLead(null);
            }}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-black/[0.08] bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingLead ? 'Edit lead' : 'New lead'}
            </h2>
            <LeadForm
              lead={editingLead}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => {
                setShowForm(false);
                setEditingLead(null);
              }}
            />
          </div>
        </div>
      )}

      {/* HubSpot Import Dialog */}
      <HubSpotImportDialog
        isOpen={showHubSpot}
        onClose={() => {
          setShowHubSpot(false);
          hubspotImport.reset();
        }}
        onImport={handleHubSpotImport}
        isLoading={hubspotImport.isPending}
        result={
          hubspotImport.isSuccess
            ? {
                imported: hubspotImport.data?.imported ?? 0,
                skipped: hubspotImport.data?.skipped ?? 0,
              }
            : null
        }
      />
    </div>
  );
}
