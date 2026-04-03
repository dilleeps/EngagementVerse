'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { MLRStatusBadge } from '../MLRStatusBadge';
import type { Campaign, Channel, MLRStatus } from '@/types';

interface CampaignData {
  name: string;
  drug: string;
  communicationType: string;
  selectedHCPIds: string[];
  channels: { channel: Channel; enabled: boolean }[];
  scheduledAt: string;
  mlrStatus: MLRStatus;
  mlrVersion: string;
}

interface Step5LaunchProps {
  campaignData: CampaignData;
}

const typeLabels: Record<string, string> = {
  LABEL_CHANGE: 'Label Change',
  SAFETY_ALERT: 'Safety Alert',
  PIPELINE_UPDATE: 'Pipeline Update',
  GENERAL: 'General',
};

const channelLabels: Record<Channel, string> = {
  VOICE: 'Voice',
  SMS: 'SMS',
  EMAIL: 'Email',
  DIGITAL: 'Digital',
};

interface CheckItem {
  id: string;
  label: string;
  autoCheck: () => boolean;
}

export function Step5Launch({ campaignData }: Step5LaunchProps) {
  const activeChannels = campaignData.channels.filter((c) => c.enabled);

  const checkItems: CheckItem[] = useMemo(
    () => [
      {
        id: 'mlr',
        label: 'MLR script approved',
        autoCheck: () => campaignData.mlrStatus === 'APPROVED',
      },
      {
        id: 'audience',
        label: 'Audience selected',
        autoCheck: () => campaignData.selectedHCPIds.length > 0,
      },
      {
        id: 'schedule',
        label: 'Schedule set',
        autoCheck: () => !!campaignData.scheduledAt,
      },
      {
        id: 'channels',
        label: 'Channels configured',
        autoCheck: () => activeChannels.length > 0,
      },
    ],
    [campaignData, activeChannels.length]
  );

  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});

  const isChecked = (item: CheckItem) => {
    if (manualChecks[item.id] !== undefined) return manualChecks[item.id];
    return item.autoCheck();
  };

  const allChecked = checkItems.every((item) => isChecked(item));

  const toggleCheck = (id: string) => {
    setManualChecks((prev) => ({
      ...prev,
      [id]: !isChecked(checkItems.find((c) => c.id === id)!),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <div className="border border-black/[0.08] rounded-lg bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Campaign Summary</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-gray-500">Campaign Name</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {campaignData.name || '--'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Drug / Product</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {campaignData.drug || '--'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Communication Type</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {campaignData.communicationType
                ? typeLabels[campaignData.communicationType] ?? campaignData.communicationType
                : '--'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Audience Size</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {campaignData.selectedHCPIds.length} HCPs
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Channels</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {activeChannels.length > 0
                ? activeChannels.map((c) => (
                    <span
                      key={c.channel}
                      className="inline-flex items-center rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark"
                    >
                      {channelLabels[c.channel]}
                    </span>
                  ))
                : <span className="text-gray-400">--</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Scheduled</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {campaignData.scheduledAt
                ? formatDate(campaignData.scheduledAt)
                : '--'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-1">MLR Status</dt>
            <dd>
              <MLRStatusBadge
                status={campaignData.mlrStatus}
                version={campaignData.mlrVersion}
              />
            </dd>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="border border-black/[0.08] rounded-lg bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Compliance Checklist
        </h3>

        <div className="space-y-3">
          {checkItems.map((item) => {
            const checked = isChecked(item);
            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCheck(item.id)}
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span
                  className={cn(
                    'text-sm',
                    checked ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {item.label}
                </span>
                {checked && (
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Launch Button */}
      <button
        type="button"
        disabled={!allChecked}
        className={cn(
          'w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors',
          allChecked
            ? 'bg-brand text-white hover:bg-brand-dark'
            : 'cursor-not-allowed bg-gray-200 text-gray-400'
        )}
      >
        Launch Campaign
      </button>

      {!allChecked && (
        <p className="text-center text-xs text-gray-500">
          Complete all checklist items before launching.
        </p>
      )}
    </div>
  );
}
