'use client';

import { ChannelToggle } from '../ChannelToggle';
import type { Channel } from '@/types';

export interface Step4Data {
  scheduledAt: string;
  channels: { channel: Channel; enabled: boolean }[];
  priorityOrder: Channel[];
}

interface Step4ScheduleProps {
  data: Step4Data;
  onChange: (data: Step4Data) => void;
}

export function Step4Schedule({ data, onChange }: Step4ScheduleProps) {
  const inputClasses =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

  const enabledChannels = data.channels.filter((c) => c.enabled);

  const handlePriorityChange = (channel: Channel, newPriority: number) => {
    const updated = [...data.priorityOrder];
    const currentIndex = updated.indexOf(channel);
    if (currentIndex !== -1) {
      updated.splice(currentIndex, 1);
    }
    const targetIndex = Math.max(0, Math.min(newPriority - 1, updated.length));
    updated.splice(targetIndex, 0, channel);
    onChange({ ...data, priorityOrder: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scheduled Date & Time
        </label>
        <input
          type="datetime-local"
          value={data.scheduledAt}
          onChange={(e) => onChange({ ...data, scheduledAt: e.target.value })}
          className={inputClasses}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Channels
        </label>
        <ChannelToggle
          channels={data.channels}
          onChange={(channels) => {
            const nowEnabled = channels
              .filter((c) => c.enabled)
              .map((c) => c.channel);
            const newPriority = [
              ...data.priorityOrder.filter((ch) => nowEnabled.includes(ch)),
              ...nowEnabled.filter((ch) => !data.priorityOrder.includes(ch)),
            ];
            onChange({ ...data, channels, priorityOrder: newPriority });
          }}
        />
      </div>

      {enabledChannels.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Channel Priority Order
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Set the priority for each enabled channel (1 = highest).
          </p>
          <div className="space-y-2">
            {data.priorityOrder
              .filter((ch) => enabledChannels.some((ec) => ec.channel === ch))
              .map((channel, index) => (
                <div
                  key={channel}
                  className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <input
                    type="number"
                    min={1}
                    max={enabledChannels.length}
                    value={index + 1}
                    onChange={(e) =>
                      handlePriorityChange(channel, parseInt(e.target.value, 10))
                    }
                    className="w-14 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {channel.charAt(0) + channel.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
