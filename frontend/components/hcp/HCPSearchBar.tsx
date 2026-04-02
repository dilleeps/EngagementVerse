'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { HCPSearchParams } from '@/types';

const SPECIALTIES = [
  'All',
  'RHEUMATOLOGY',
  'DERMATOLOGY',
  'GASTROENTEROLOGY',
  'HEMATOLOGY',
  'ONCOLOGY',
  'OTHER',
] as const;

const KOL_TIERS = ['All', 'TIER_1', 'TIER_2', 'TIER_3', 'NONE'] as const;

interface HCPSearchBarProps {
  onSearch: (params: HCPSearchParams) => void;
  initialValues?: HCPSearchParams;
}

export function HCPSearchBar({ onSearch, initialValues }: HCPSearchBarProps) {
  const [q, setQ] = useState(initialValues?.q ?? '');
  const [specialty, setSpecialty] = useState(initialValues?.specialty ?? 'All');
  const [kolTier, setKolTier] = useState(initialValues?.kolTier ?? 'All');
  const [state, setState] = useState(initialValues?.state ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      q: q || undefined,
      specialty: specialty === 'All' ? undefined : specialty,
      kolTier: kolTier === 'All' ? undefined : kolTier,
      state: state || undefined,
    });
  };

  const inputClasses =
    'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Search</label>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, NPI, institution..."
          className={cn(inputClasses, 'w-56')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Specialty</label>
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
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">KOL Tier</label>
        <select
          value={kolTier}
          onChange={(e) => setKolTier(e.target.value)}
          className={cn(inputClasses, 'w-36')}
        >
          {KOL_TIERS.map((t) => (
            <option key={t} value={t}>
              {t === 'All'
                ? 'All Tiers'
                : t === 'NONE'
                  ? 'None'
                  : t.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">State</label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="e.g. CA"
          className={cn(inputClasses, 'w-24')}
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
      >
        Search
      </button>
    </form>
  );
}
