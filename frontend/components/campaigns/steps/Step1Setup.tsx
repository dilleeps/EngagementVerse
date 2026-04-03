'use client';

import { cn } from '@/lib/utils';
import type { CommunicationType } from '@/types';

const DRUGS = [
  'Humira',
  'Keytruda',
  'Opdivo',
  'Revlimid',
  'Eliquis',
  'Imbruvica',
  'Stelara',
  'Bimzelx',
  'Rinvoq',
  'Skyrizi',
];

const COMMUNICATION_TYPES: { value: CommunicationType; label: string }[] = [
  { value: 'LABEL_CHANGE', label: 'Label Change' },
  { value: 'SAFETY_ALERT', label: 'Safety Alert' },
  { value: 'PIPELINE_UPDATE', label: 'Pipeline Update' },
  { value: 'GENERAL', label: 'General' },
];

export interface Step1Data {
  name: string;
  drug: string;
  communicationType: CommunicationType | '';
}

interface Step1SetupProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}

export function Step1Setup({ data, onChange }: Step1SetupProps) {
  const inputClasses =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Campaign Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g. Q2 Rheumatology Outreach"
          className={inputClasses}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Drug / Product
        </label>
        <select
          value={data.drug}
          onChange={(e) => onChange({ ...data, drug: e.target.value })}
          className={inputClasses}
        >
          <option value="">Select a drug...</option>
          {DRUGS.map((drug) => (
            <option key={drug} value={drug}>
              {drug}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Communication Type
        </label>
        <select
          value={data.communicationType}
          onChange={(e) =>
            onChange({ ...data, communicationType: e.target.value as CommunicationType })
          }
          className={inputClasses}
        >
          <option value="">Select type...</option>
          {COMMUNICATION_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
