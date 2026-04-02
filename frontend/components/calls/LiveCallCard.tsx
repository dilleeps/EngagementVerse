"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import type { CallSession } from "@/types";

interface LiveCallCardProps {
  call: CallSession;
  startedAt: string;
  className?: string;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function LiveCallCard({ call, startedAt, className }: LiveCallCardProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();

    function tick() {
      const now = Date.now();
      setElapsed(Math.max(0, Math.floor((now - start) / 1000)));
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const hcpName = call.hcp
    ? `${call.hcp.firstName} ${call.hcp.lastName}`
    : "Unknown HCP";
  const specialty = call.hcp?.specialty ?? "OTHER";

  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4 border-l-4 border-l-brand",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">{hcpName}</h3>
          <p className="mt-0.5 text-sm text-gray-500 capitalize">
            {specialty.toLowerCase()}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="live">{call.channel}</Badge>
          <StatusDot status="live" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <span className="text-sm font-medium text-gray-700">Live</span>
        <span className="ml-auto text-2xl font-mono font-semibold text-gray-900 tabular-nums tracking-wider">
          {formatElapsed(elapsed)}
        </span>
      </div>
    </div>
  );
}
