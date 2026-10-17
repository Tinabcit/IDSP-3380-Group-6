import type { Metadata, Viewport } from 'next';
import { Public_Sans } from 'next/font/google';
import { AppShell } from '@/components/app-shell/app-shell';
import { PlannerProvider } from '@/components/app-shell/planner-provider';
import { ToastProvider } from '@/components/app-shell/toast-provider';
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

/**
 * The frame around EVERY page. From the outside in:
 *   1. PlannerProvider - loads the data so every page can use it
 *   2. ToastProvider - lets any page show a toast in the top right corner
 *   3. AppShell - the header, menu and footer
 *   4. the page itself
 * It also sets the font and the page title.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body className="font-sans">
        <PlannerProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </PlannerProvider>
      </body>
    </html>
  );
}
