'use client';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { MLRStatusBadge } from './MLRStatusBadge';
import type { Channel, CommunicationType, MLRStatus } from '@/types';

interface CampaignPreviewData {
  name?: string;
  drug?: string;
  communicationType?: CommunicationType;
  audienceCount?: number;
  channels?: { channel: Channel; enabled: boolean }[];
  scheduledAt?: string;
  mlrStatus?: MLRStatus;
  mlrVersion?: string;
}

interface CampaignPreviewCardProps {
  campaign: CampaignPreviewData;
}

const typeLabels: Record<CommunicationType, string> = {
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

export function CampaignPreviewCard({ campaign }: CampaignPreviewCardProps) {
  const activeChannels = campaign.channels?.filter((c) => c.enabled) ?? [];

  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Campaign Preview</h3>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium text-gray-500">Name</dt>
          <dd className="mt-0.5 text-gray-900">
            {campaign.name || <span className="text-gray-300 italic">Not set</span>}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-gray-500">Drug / Product</dt>
          <dd className="mt-0.5 text-gray-900">
            {campaign.drug || <span className="text-gray-300 italic">Not set</span>}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-gray-500">Type</dt>
          <dd className="mt-0.5 text-gray-900">
            {campaign.communicationType
              ? typeLabels[campaign.communicationType]
              : <span className="text-gray-300 italic">Not set</span>}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-gray-500">Audience</dt>
          <dd className="mt-0.5 text-gray-900">
            {campaign.audienceCount !== undefined
              ? `${campaign.audienceCount} HCPs`
              : <span className="text-gray-300 italic">Not set</span>}
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
              : <span className="text-gray-300 italic text-xs">Not set</span>}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-gray-500">Schedule</dt>
          <dd className="mt-0.5 text-gray-900">
            {campaign.scheduledAt
              ? formatDate(campaign.scheduledAt)
              : <span className="text-gray-300 italic">Not set</span>}
          </dd>
        </div>

        {campaign.mlrStatus && campaign.mlrVersion && (
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-1">MLR Status</dt>
            <dd>
              <MLRStatusBadge status={campaign.mlrStatus} version={campaign.mlrVersion} />
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
