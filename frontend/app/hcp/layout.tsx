import { AppShell } from '@/components/layout/AppShell';

export default function HCPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell title="HCP profiles">{children}</AppShell>;
}
