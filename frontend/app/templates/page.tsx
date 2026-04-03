'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useEmailTemplates,
  useTemplateCategories,
  type EmailTemplateFilters,
} from '@/hooks/useEmailTemplates';
import { TemplateCard } from '@/components/templates/TemplateCard';

const CATEGORY_TABS = [
  { value: '', label: 'All' },
  { value: 'OUTREACH', label: 'Outreach' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'DRUG_UPDATE', label: 'Drug Update' },
  { value: 'SAFETY_ALERT', label: 'Safety Alert' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'GENERAL', label: 'General' },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filters: EmailTemplateFilters = {
    category: selectedCategory || undefined,
    q: search || undefined,
    page,
    size: 20,
  };

  const { data, isLoading } = useEmailTemplates(filters);
  const { data: categories } = useTemplateCategories();

  const templates = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  // Build count lookup from categories data
  const countByCategory: Record<string, number> = {};
  let totalCount = 0;
  categories?.forEach((c) => {
    countByCategory[c.category] = c.count;
    totalCount += c.count;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Email templates</h1>
        <Link
          href="/templates/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          New template
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-black/[0.08]">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.value;
          const count =
            tab.value === '' ? totalCount : (countByCategory[tab.value] ?? 0);
          return (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedCategory(tab.value);
                setPage(1);
              }}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-brand'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search templates..."
          className="w-72 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <span className="text-sm text-gray-400">
          {total} template{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-400">No templates found</p>
          <Link
            href="/templates/new"
            className="mt-3 inline-block text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
