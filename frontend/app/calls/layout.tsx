import { AppShell } from '@/components/layout/AppShell';

export default function CallsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell title="AI calls">{children}</AppShell>;
}
