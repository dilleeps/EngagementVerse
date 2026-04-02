import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, color, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-gray-200", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300", !color && "bg-brand")}
        style={{
          width: `${clamped}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
}
