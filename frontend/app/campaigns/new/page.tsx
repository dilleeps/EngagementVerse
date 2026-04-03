'use client';

import { useRouter } from 'next/navigation';
import { useCreateCampaign } from '@/hooks/useCampaign';
import { CampaignWizard } from '@/components/campaigns/CampaignWizard';
import type { CreateCampaignPayload } from '@/types';

export default function NewCampaignPage() {
  const router = useRouter();
  const createMutation = useCreateCampaign();

  const handleCreate = async (payload: CreateCampaignPayload) => {
    const campaign = await createMutation.mutateAsync(payload);
    router.push(`/campaigns/${campaign.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Create campaign
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new engagement campaign by completing each step below.
        </p>
      </div>

      <CampaignWizard
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
        error={createMutation.error?.message}
      />
    </div>
  );
}
