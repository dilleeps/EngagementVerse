import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "live" | "offline" | "idle";
  className?: string;
}

const dotStyles: Record<StatusDotProps["status"], string> = {
  live: "bg-green-500",
  offline: "bg-gray-400",
  idle: "bg-amber-400",
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5", className)}>
      {status === "live" && (
        <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-green-500 opacity-75" />
      )}
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          dotStyles[status]
        )}
      />
    </span>
  );
}
