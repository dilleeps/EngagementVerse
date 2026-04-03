'use client';

import { use } from 'react';
import { useHCPProfile } from '@/hooks/useHCPProfile';
import { HCPProfileHeader } from '@/components/hcp/HCPProfileHeader';
import { PrescribingTable } from '@/components/hcp/PrescribingTable';
import { EngagementTimeline } from '@/components/hcp/EngagementTimeline';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-black/[0.08] bg-white p-4 ${className ?? ''}`}
    >
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="mt-4 h-24 rounded bg-gray-100" />
    </div>
  );
}

export default function HCPProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { profile, prescribing, engagement, isLoading } = useHCPProfile(id);

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <div className="w-72 shrink-0 space-y-4">
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-40" />
        </div>
        <div className="flex-1 space-y-4">
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-96" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            HCP not found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This healthcare professional profile could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left sidebar */}
      <div className="w-72 shrink-0 space-y-4">
        <HCPProfileHeader profile={profile} />

        {/* Contact info card */}
        <div className="rounded-lg border border-black/[0.08] bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Contact information
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            {profile.email && (
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="text-gray-900">{profile.email}</dd>
              </div>
            )}
            {profile.phone && (
              <div>
                <dt className="text-xs text-gray-500">Phone</dt>
                <dd className="text-gray-900">{profile.phone}</dd>
              </div>
            )}
            {profile.npiNumber && (
              <div>
                <dt className="text-xs text-gray-500">NPI</dt>
                <dd className="font-mono text-gray-900">
                  {profile.npiNumber}
                </dd>
              </div>
            )}
            {profile.institution && (
              <div>
                <dt className="text-xs text-gray-500">Institution</dt>
                <dd className="text-gray-900">{profile.institution}</dd>
              </div>
            )}
            {(profile.city || profile.state) && (
              <div>
                <dt className="text-xs text-gray-500">Location</dt>
                <dd className="text-gray-900">
                  {[profile.city, profile.state].filter(Boolean).join(', ')}
                </dd>
              </div>
            )}
            {profile.preferredChannel && (
              <div>
                <dt className="text-xs text-gray-500">Preferred channel</dt>
                <dd className="text-gray-900">{profile.preferredChannel}</dd>
              </div>
            )}
            {profile.bestContactTime && (
              <div>
                <dt className="text-xs text-gray-500">Best time to contact</dt>
                <dd className="text-gray-900">{profile.bestContactTime}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 space-y-6">
        {prescribing && <PrescribingTable data={prescribing} />}

        {engagement && <EngagementTimeline data={engagement} />}
      </div>
    </div>
  );
}
