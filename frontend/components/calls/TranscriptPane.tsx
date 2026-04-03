"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TranscriptLine {
  id: string;
  speaker: "AI" | "HCP";
  text: string;
  timestamp: string;
}

interface TranscriptPaneProps {
  lines: TranscriptLine[];
  className?: string;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function TranscriptPane({ lines, className }: TranscriptPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Transcript</h3>
      <div
        ref={scrollRef}
        className="max-h-96 overflow-y-auto space-y-3 pr-1"
      >
        {lines.map((line) => (
          <div key={line.id} className="flex gap-3">
            <span
              className={cn(
                "shrink-0 w-8 text-xs font-bold mt-0.5",
                line.speaker === "AI" ? "text-brand" : "text-gray-400"
              )}
            >
              {line.speaker}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-relaxed">
                {line.text}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {formatTime(line.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {lines.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Waiting for transcript...
          </p>
        )}
      </div>
    </div>
  );
}
