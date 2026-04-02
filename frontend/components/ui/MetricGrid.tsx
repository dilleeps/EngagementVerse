import { cn } from "@/lib/utils";

interface MetricGridProps {
  children: React.ReactNode;
  cols?: 2 | 4;
  className?: string;
}

export function MetricGrid({ children, cols = 4, className }: MetricGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  );
}
