'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/hooks/useLeads';

type SortField =
  | 'contact_name'
  | 'company_name'
  | 'contact_email'
  | 'status'
  | 'lead_source'
  | 'deal_value'
  | 'assigned_to';

type SortDir = 'asc' | 'desc';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  PROPOSAL: 'bg-purple-100 text-purple-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  WON: 'bg-emerald-100 text-emerald-800',
  LOST: 'bg-red-100 text-red-700',
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

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const COLUMNS: { key: SortField; label: string }[] = [
  { key: 'contact_name', label: 'Name' },
  { key: 'company_name', label: 'Company' },
  { key: 'contact_email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'lead_source', label: 'Source' },
  { key: 'deal_value', label: 'Deal Value' },
  { key: 'assigned_to', label: 'Assigned To' },
];

export function LeadTable({ leads, onEdit, onDelete }: LeadTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('contact_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...(leads ?? [])].sort((a, b) => {
    const aVal = (a as any)[sortField] ?? '';
    const bVal = (b as any)[sortField] ?? '';
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-black/[0.08] bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 select-none"
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortField === col.key && (
                    <span className="text-brand">
                      {sortDir === 'asc' ? '\u2191' : '\u2193'}
                    </span>
                  )}
                </span>
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((lead) => {
            const statusKey = (lead.status ?? 'NEW').toUpperCase();
            const statusClass =
              STATUS_COLORS[statusKey] ?? 'bg-gray-100 text-gray-700';

            return (
              <tr
                key={lead.id}
                onClick={() => router.push(`/leads/${lead.id}`)}
                className="cursor-pointer transition-colors hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                  {lead.contact_name ?? '--'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {lead.company_name ?? '--'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {lead.contact_email ?? '--'}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                  >
                    {lead.status ?? 'NEW'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {lead.lead_source ?? '--'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(lead.deal_value)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {lead.assigned_to ?? '--'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(lead);
                      }}
                      className="rounded px-2 py-1 text-xs font-medium text-brand hover:bg-brand-light transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(lead);
                      }}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-8 text-center text-sm text-gray-400"
              >
                No leads found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
