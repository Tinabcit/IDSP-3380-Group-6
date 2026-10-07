import type { Metadata, Viewport } from 'next';
import { Public_Sans } from 'next/font/google';
import { AppShell } from '@/components/app-shell/app-shell';
import { PlannerProvider } from '@/components/app-shell/planner-provider';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tri-Cities Chamber',
  description: 'Contracts, events, sponsor deliverables and reminders in one place.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body className="font-sans">
        <PlannerProvider>
          <AppShell>{children}</AppShell>
        </PlannerProvider>
      </body>
    </html>
  );
}
