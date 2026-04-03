'use client';

import Link from 'next/link';
import type { EmailTemplate } from '@/hooks/useEmailTemplates';

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
  });
}

interface TemplateCardProps {
  template: EmailTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const categoryKey = (template.category ?? 'GENERAL').toUpperCase();
  const categoryClass = CATEGORY_COLORS[categoryKey] ?? 'bg-gray-100 text-gray-700';
  const categoryLabel = CATEGORY_LABELS[categoryKey] ?? categoryKey;
  const variableCount = template.variables?.length ?? 0;

  return (
    <Link href={`/templates/${template.id}`}>
      <div className="group rounded-lg border border-black/[0.08] bg-white p-4 transition-shadow hover:shadow-md cursor-pointer">
        {/* Top row: category badge + active indicator */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryClass}`}
          >
            {categoryLabel}
          </span>
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${
              template.is_active ? 'bg-green-500' : 'bg-gray-300'
            }`}
            title={template.is_active ? 'Active' : 'Inactive'}
          />
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors truncate">
          {template.name}
        </h3>

        {/* Subject preview */}
        <p className="mt-1 text-xs text-gray-500 truncate">
          {template.subject}
        </p>

        {/* Footer: variable count + date */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>
            {variableCount} variable{variableCount !== 1 ? 's' : ''}
          </span>
          <span>{formatDate(template.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
