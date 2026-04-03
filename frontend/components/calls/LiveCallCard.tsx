"use client";

import { useEffect, useState } from "react";
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
  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function LiveCallCard({
  call,
  startedAt,
  className,
}: LiveCallCardProps) {
  const [elapsed, setElapsed] = useState<number>(() => {
    return Math.max(
      0,
      Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    );
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(
        Math.max(
          0,
          Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const hcpName = call.hcp
    ? `${call.hcp.firstName} ${call.hcp.lastName}`
    : call.hcpId;
  const specialty = call.hcp?.specialty ?? "—";

  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4 border-l-4 border-l-green-500",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-900">{hcpName}</h3>
          <p className="text-sm text-gray-500">
            {specialty === "—"
              ? specialty
              : specialty.charAt(0) + specialty.slice(1).toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status="live" />
          <Badge variant="live">Live</Badge>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Badge variant={call.channel === "VOICE" ? "active" : "scheduled"}>
          {call.channel}
        </Badge>
        <span className="text-xl font-mono font-semibold text-gray-900 tabular-nums">
          {formatElapsed(elapsed)}
        </span>
      </div>
    </div>
  );
}
