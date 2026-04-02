'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { HCP, KOLTier } from '@/types';

interface HCPCardProps {
  hcp: HCP;
}

const kolTierColors: Record<KOLTier, { bg: string; text: string; label: string }> = {
  TIER_1: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Tier 1' },
  TIER_2: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Tier 2' },
  TIER_3: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Tier 3' },
  NONE: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'No Tier' },
};

export function HCPCard({ hcp }: HCPCardProps) {
  const fullName = `${hcp.firstName} ${hcp.lastName}`;
  const tier = kolTierColors[hcp.kolTier];

  return (
    <Link href={`/hcp/${hcp.id}`}>
      <div className="border border-black/[0.08] rounded-lg bg-white p-4 hover:bg-brand-light transition-colors cursor-pointer">
        <div className="flex items-start gap-3">
          <Avatar name={fullName} size="md" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {fullName}
              </h3>
              <Badge variant="active">
                {hcp.specialty.charAt(0) + hcp.specialty.slice(1).toLowerCase()}
              </Badge>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  tier.bg,
                  tier.text
                )}
              >
                {tier.label}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-gray-500 truncate">
              {hcp.institution} &middot; {hcp.city}, {hcp.state}
            </p>

            <div className="mt-2 flex items-center gap-4">
              <div className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  {hcp.engagementScore}
                </span>{' '}
                influence
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                <span className="text-xs text-gray-500 shrink-0">Engagement</span>
                <ProgressBar value={hcp.engagementScore} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
