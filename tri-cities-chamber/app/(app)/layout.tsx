import { Suspense } from 'react';
import { AppShell } from '@/components/app-shell/app-shell';

/**
 * The frame for every app page (sidebar, footer, phone menu). The landing page at "/" is outside this group.
 * The sidebar reads the current URL, so it is wrapped in Suspense (it fills in once the browser has it).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
