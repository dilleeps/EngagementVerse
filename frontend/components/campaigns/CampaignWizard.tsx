'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Step1Setup, type Step1Data } from './steps/Step1Setup';
import { Step2Audience, type Step2Data } from './steps/Step2Audience';
import { Step3Script } from './steps/Step3Script';
import { Step4Schedule, type Step4Data } from './steps/Step4Schedule';
import { Step5Launch } from './steps/Step5Launch';
import { CampaignPreviewCard } from './CampaignPreviewCard';
import type { Channel, MLRStatus } from '@/types';

interface CampaignWizardProps {
  campaignId?: string;
}

const STEPS = [
  { number: 1, label: 'Setup' },
  { number: 2, label: 'Audience' },
  { number: 3, label: 'Script' },
  { number: 4, label: 'Schedule' },
  { number: 5, label: 'Launch' },
];

const DEFAULT_CHANNELS: { channel: Channel; enabled: boolean }[] = [
  { channel: 'VOICE', enabled: false },
  { channel: 'SMS', enabled: false },
  { channel: 'EMAIL', enabled: false },
  { channel: 'DIGITAL', enabled: false },
];

export function CampaignWizard({ campaignId }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    name: '',
    drug: '',
    communicationType: '',
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    selectedHCPIds: [],
  });

  const [step4Data, setStep4Data] = useState<Step4Data>({
    scheduledAt: '',
    channels: DEFAULT_CHANNELS,
    priorityOrder: [],
  });

  const [mlrStatus] = useState<MLRStatus>('DRAFT');
  const [mlrVersion] = useState('1');

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Setup data={step1Data} onChange={setStep1Data} />;
      case 2:
        return (
          <Step2Audience
            data={step2Data}
            onChange={setStep2Data}
            campaignId={campaignId}
          />
        );
      case 3:
        return <Step3Script campaignId={campaignId} />;
      case 4:
        return <Step4Schedule data={step4Data} onChange={setStep4Data} />;
      case 5:
        return (
          <Step5Launch
            campaignData={{
              name: step1Data.name,
              drug: step1Data.drug,
              communicationType: step1Data.communicationType,
              selectedHCPIds: step2Data.selectedHCPIds,
              channels: step4Data.channels,
              scheduledAt: step4Data.scheduledAt,
              mlrStatus,
              mlrVersion,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main wizard area */}
      <div className="flex-1 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step.number} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                      isActive && 'bg-brand text-white',
                      isCompleted && 'bg-brand text-white',
                      !isActive && !isCompleted && 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-1 text-xs font-medium',
                      isActive || isCompleted ? 'text-brand' : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connecting line */}
                {!isLast && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1 rounded-full',
                      isCompleted ? 'bg-brand' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="border border-black/[0.08] rounded-lg bg-white p-6">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              currentStep === 1
                ? 'cursor-not-allowed text-gray-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            Back
          </button>

          {currentStep < 5 && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Preview sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-4">
          <CampaignPreviewCard
            campaign={{
              name: step1Data.name,
              drug: step1Data.drug,
              communicationType: step1Data.communicationType || undefined,
              audienceCount: step2Data.selectedHCPIds.length,
              channels: step4Data.channels,
              scheduledAt: step4Data.scheduledAt || undefined,
              mlrStatus,
              mlrVersion,
            }}
          />
        </div>
      </div>
    </div>
  );
}
