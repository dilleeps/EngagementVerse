"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

const bgColors = [
  "bg-brand",
  "bg-brand-dark",
  "bg-brand-accent",
  "bg-emerald-600",
  "bg-teal-600",
  "bg-cyan-600",
  "bg-sky-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-purple-600",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const colorIndex = hashName(name) % bgColors.length;
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white shrink-0",
        bgColors[colorIndex],
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
