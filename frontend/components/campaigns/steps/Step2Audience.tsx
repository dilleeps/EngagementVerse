'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { useHCPSearch } from '@/hooks/useHCPSearch';
import type { Specialty, KOLTier } from '@/types';

const SPECIALTIES: (Specialty | 'All')[] = [
  'All',
  'RHEUMATOLOGY',
  'DERMATOLOGY',
  'GASTROENTEROLOGY',
  'HEMATOLOGY',
  'ONCOLOGY',
  'OTHER',
];

const KOL_TIERS: (KOLTier | 'All')[] = ['All', 'TIER_1', 'TIER_2', 'TIER_3', 'NONE'];

export interface Step2Data {
  selectedHCPIds: string[];
}

interface Step2AudienceProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  campaignId?: string;
}

export function Step2Audience({ data, onChange, campaignId }: Step2AudienceProps) {
  const [specialty, setSpecialty] = useState<string>('All');
  const [tier, setTier] = useState<string>('All');
  const [search, setSearch] = useState('');

  const { hcps, isLoading } = useHCPSearch({
    q: search || undefined,
    specialty: specialty === 'All' ? undefined : specialty,
    kolTier: tier === 'All' ? undefined : tier,
    size: 100,
  });

  const handleToggle = (id: string) => {
    const ids = data.selectedHCPIds.includes(id)
      ? data.selectedHCPIds.filter((h) => h !== id)
      : [...data.selectedHCPIds, id];
    onChange({ ...data, selectedHCPIds: ids });
  };

  const handleSelectAll = () => {
    const allIds = hcps.map((h) => h.id);
    const allSelected = allIds.every((id) => data.selectedHCPIds.includes(id));
    if (allSelected) {
      onChange({
        ...data,
        selectedHCPIds: data.selectedHCPIds.filter((id) => !allIds.includes(id)),
      });
    } else {
      const merged = Array.from(new Set([...data.selectedHCPIds, ...allIds]));
      onChange({ ...data, selectedHCPIds: merged });
    }
  };

  const inputClasses =
    'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className={cn(inputClasses, 'w-44')}
        >
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All Specialties' : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className={cn(inputClasses, 'w-36')}
        >
          {KOL_TIERS.map((t) => (
            <option key={t} value={t}>
              {t === 'All' ? 'All Tiers' : t === 'NONE' ? 'None' : t.replace('_', ' ')}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search HCPs..."
          className={cn(inputClasses, 'flex-1 min-w-[200px]')}
        />

        <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-white">
          {data.selectedHCPIds.length} selected
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
        {/* Select all header */}
        {hcps.length > 0 && (
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2">
            <input
              type="checkbox"
              checked={hcps.length > 0 && hcps.every((h) => data.selectedHCPIds.includes(h.id))}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            <span className="text-xs font-medium text-gray-500">Select all visible</span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-gray-400">Loading HCPs...</span>
          </div>
        )}

        {!isLoading && hcps.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-gray-400">No HCPs match your filters.</span>
          </div>
        )}

        {hcps.map((hcp) => {
          const fullName = `${hcp.firstName} ${hcp.lastName}`;
          const isSelected = data.selectedHCPIds.includes(hcp.id);

          return (
            <label
              key={hcp.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2.5 transition-colors last:border-b-0',
                isSelected ? 'bg-brand-light' : 'hover:bg-gray-50'
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(hcp.id)}
                className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              <Avatar name={fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                <p className="text-xs text-gray-500 truncate">
                  {hcp.specialty.charAt(0) + hcp.specialty.slice(1).toLowerCase()} &middot;{' '}
                  {hcp.institution}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">
                {hcp.kolTier !== 'NONE' ? hcp.kolTier.replace('_', ' ') : ''}
              </span>
              <span className="shrink-0 text-xs text-gray-400">{hcp.state}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
