"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface TopbarProps {
  title: string;
  badge?: {
    label: string;
    variant: "live" | "completed" | "scheduled" | "active";
  };
}

export function Topbar({ title, badge }: TopbarProps) {
  return (
    <header className="fixed left-[200px] right-0 top-0 z-20 flex h-12 items-center justify-between border-b border-black/[0.08] bg-white px-6">
      {/* Left: title + optional badge */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
        {badge && (
          <Badge variant={badge.variant}>{badge.label}</Badge>
        )}
      </div>

      {/* Right: notification bell + avatar */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z"
              clipRule="evenodd"
            />
          </svg>
          {/* Notification dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User avatar dropdown */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-100"
        >
          <Avatar name="Sarah Chen" size="sm" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3.5 w-3.5 text-gray-400"
          >
            <path
              fillRule="evenodd"
              d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
