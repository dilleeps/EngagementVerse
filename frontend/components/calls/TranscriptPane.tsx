"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface TranscriptLine {
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
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function TranscriptPane({ lines, className }: TranscriptPaneProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white flex flex-col",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Transcript</h3>
      </div>

      <div className="flex-1 overflow-y-auto max-h-96 px-4 py-3 space-y-3">
        {lines.map((line) => {
          const isAI = line.speaker === "AI";

          return (
            <div key={line.id} className="flex gap-3">
              <span
                className={cn(
                  "mt-0.5 shrink-0 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                  isAI
                    ? "bg-brand-light text-brand"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {line.speaker}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {line.text}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400 tabular-nums">
                  {formatTime(line.timestamp)}
                </p>
              </div>
            </div>
          );
        })}

        {lines.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            Waiting for transcript...
          </p>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
