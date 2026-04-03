"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  badge?: {
    label: string;
    variant: "live" | "completed" | "scheduled" | "active";
  };
}

export function AppShell({ children, title, badge }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar title={title} badge={badge} />
      <main className="ml-[200px] mt-12 min-h-screen p-6">{children}</main>
    </div>
  );
}
