"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "\u{1F4CA}" },
  { label: "AI Calls", href: "/calls", icon: "\u{1F4DE}" },
  { label: "HCP Profiles", href: "/hcp", icon: "\u{1F464}" },
  { label: "Campaigns", href: "/campaigns", icon: "\u{1F4E3}" },
  { label: "Analytics", href: "/analytics", icon: "\u{1F4C8}" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[200px] flex-col bg-brand-darker text-white">
      {/* Brand */}
      <div className="flex h-12 items-center gap-2 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand font-bold text-sm text-white">
          E
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Engagement Verse
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Avatar name="Sarah Chen" size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">
              Sarah Chen
            </p>
            <p className="truncate text-[10px] text-white/50">
              Medical affairs
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
