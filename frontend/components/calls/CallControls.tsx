"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CallControlsProps {
  callId?: string;
  status?: string;
  onMute?: () => void;
  onTransfer?: () => void;
  onEscalate?: () => void;
  onEnd: () => void;
  isMuted?: boolean;
  isEscalating?: boolean;
  isEnding?: boolean;
  className?: string;
}

export function CallControls({
  onMute,
  onTransfer,
  onEscalate,
  onEnd,
  isMuted: isMutedProp,
  isEscalating,
  isEnding,
  className,
}: CallControlsProps) {
  const [localMuted, setLocalMuted] = useState(false);
  const isMuted = isMutedProp ?? localMuted;

  const handleMute = () => {
    if (onMute) {
      onMute();
    } else {
      setLocalMuted(!localMuted);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 rounded-lg border border-black/[0.08] bg-white px-4 py-3",
        className
      )}
    >
      {/* Mute / Unmute */}
      <button
        type="button"
        onClick={handleMute}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          isMuted
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V6a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        {isMuted ? "Unmute" : "Mute"}
      </button>

      {/* Transfer to MSL */}
      <button
        type="button"
        onClick={onEscalate ?? onTransfer}
        disabled={isEscalating}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
        {isEscalating ? "Transferring..." : "Transfer to MSL"}
      </button>

      {/* End Call */}
      <button
        type="button"
        onClick={onEnd}
        disabled={isEnding}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5a11.952 11.952 0 00-6.68-2.039 11.959 11.959 0 00-6.719 2.074l-.343.219a1.11 1.11 0 01-1.418-.17l-1.283-1.284a1.112 1.112 0 01-.166-1.392 16.585 16.585 0 017.926-7.084 1.098 1.098 0 011.046.067l1.724 1.074a1.11 1.11 0 001.312-.074l1.724-1.413a1.11 1.11 0 011.093-.148 16.59 16.59 0 013.74 2.343 1.112 1.112 0 01.166 1.392l-1.283 1.283a1.11 1.11 0 01-1.418.17l-.344-.219z" />
        </svg>
        {isEnding ? "Ending..." : "End call"}
      </button>
    </div>
  );
}
