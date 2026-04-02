import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: string;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div className={cn("border-b border-gray-200 pb-2", className)}>
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {children}
      </span>
    </div>
  );
}
