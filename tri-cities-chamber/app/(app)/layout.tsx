import { Suspense } from 'react';
import { connection } from 'next/server';

import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell/app-shell';
import { getDisplayUser } from '@/lib/planner/user';

/** Reads the Google session and hands the person to the shell (so the sidebar shows their name). */
async function ShellWithUser({ children }: { children: React.ReactNode }) {
  // Wait for a real request first: reading the session cannot be prerendered.
  await connection();
  const session = await auth();
  return <AppShell user={getDisplayUser(session?.user)}>{children}</AppShell>;
}

/**
 * The frame for every app page (sidebar, footer, phone menu). The landing page at "/" is outside this group.
 * The sidebar reads the current URL and the session, so it is wrapped in Suspense (it fills in once they are known).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ShellWithUser>{children}</ShellWithUser>
    </Suspense>
  );
}
