import type { Metadata, Viewport } from 'next';
import { Public_Sans } from 'next/font/google';
import { PlannerProvider } from '@/components/app-shell/planner-provider';
import { ToastProvider } from '@/components/app-shell/toast-provider';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

/** Small script run in the browser before paint: reads the saved theme and sets the "dark" class. */
const THEME_INIT_SCRIPT = `try{var c=localStorage.getItem('${THEME_STORAGE_KEY}');var d=c==='dark'||(c!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}`;

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
 *   3. the page itself (app pages get the AppShell sidebar from app/(app)/layout.tsx)
 * It also sets the font and the page title.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before the page paints, so there is no flash of the wrong colours. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <PlannerProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </PlannerProvider>
      </body>
    </html>
  );
}
