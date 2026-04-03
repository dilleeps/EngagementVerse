'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { useHCPSearch } from '@/hooks/useHCPSearch';
import type { Specialty } from '@/types';

const SPECIALTIES: (Specialty | 'All')[] = [
  'All',
  'RHEUMATOLOGY',
  'DERMATOLOGY',
  'GASTROENTEROLOGY',
  'HEMATOLOGY',
  'ONCOLOGY',
  'OTHER',
];

interface AudienceSelectorProps {
  selected: string[];
  onSelect: (ids: string[]) => void;
}

export function AudienceSelector({ selected, onSelect }: AudienceSelectorProps) {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState<string>('All');

  const { hcps, isLoading } = useHCPSearch({
    q: search || undefined,
    specialty: specialty === 'All' ? undefined : specialty,
    size: 50,
  });

  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  const inputClasses =
    'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
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

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search HCPs..."
          className={cn(inputClasses, 'flex-1')}
        />

        <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-white">
          {selected.length} selected
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        )}

        {!isLoading && hcps.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-gray-400">No HCPs found.</span>
          </div>
        )}

        {hcps.map((hcp) => {
          const fullName = `${hcp.firstName} ${hcp.lastName}`;
          const isSelected = selected.includes(hcp.id);

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
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {hcp.specialty.charAt(0) + hcp.specialty.slice(1).toLowerCase()} &middot;{' '}
                  {hcp.institution}
                </p>
              </div>
              <span className="text-xs text-gray-400">{hcp.state}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
