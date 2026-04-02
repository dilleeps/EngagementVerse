'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { HCP } from '@/types';

interface HCPProfileHeaderProps {
  hcp: HCP;
}

export function HCPProfileHeader({ hcp }: HCPProfileHeaderProps) {
  const fullName = `${hcp.firstName} ${hcp.lastName}`;

  const stats = [
    { label: 'Influence Score', value: hcp.engagementScore },
    { label: 'Engagement Score', value: hcp.engagementScore },
    { label: 'Publications', value: hcp.totalCalls },
    { label: 'Citations', value: hcp.totalCalls * 12 },
  ];

  const tags = [
    hcp.specialty.charAt(0) + hcp.specialty.slice(1).toLowerCase(),
    hcp.kolTier !== 'NONE' ? hcp.kolTier.replace('_', ' ') : null,
    hcp.state,
  ].filter(Boolean);

  return (
    <div className="border border-black/[0.08] rounded-lg bg-white p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <Avatar name={fullName} size="lg" className="h-16 w-16 text-xl" />

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {hcp.specialty.charAt(0) + hcp.specialty.slice(1).toLowerCase()} &middot;{' '}
            {hcp.institution}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-dark"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Preferred Channel</span>
              <Badge variant="active">{hcp.preferredChannel}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Best Contact Time</span>
              <span className="text-xs font-medium text-gray-700">
                {hcp.lastContactDate ? 'Morning' : 'Afternoon'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
