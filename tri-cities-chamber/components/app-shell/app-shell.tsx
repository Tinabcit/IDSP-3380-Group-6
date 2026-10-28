"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  AppSidebar,
  HomeFiltersProvider,
  NAV,
  UserSelect,
  isActive,
} from "./app-sidebar";
import { OverdueBell } from "./overdue-bell";
import { useOptionalPlannerData } from "./planner-provider";
import { ReminderToasts } from "./reminder-toasts";
import { useToast } from "./toast-provider";

/**
 * The part of the page that stays the same on every route:
 * the sidebar (see app-sidebar.tsx), the footer (backup and reset buttons),
 * and on phones the small top bar and the bottom menu.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const data = useOptionalPlannerData();
  const toast = useToast();

  /**
   * Downloads all the app data as a .json file (a backup).
   * It makes a temporary download link and clicks it for you.
   */
  function downloadBackup() {
    if (!data) return;
    const blob = new Blob([data.exportBackup(data.today)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chamber-backup-${data.today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Backup downloaded" });
  }

  return (
    <HomeFiltersProvider>
      <div className="flex min-h-dvh">
        {/* The sidebar, down the left edge on tablet and up. It stays put while the page scrolls. */}
        <AppSidebar className="sticky top-0 z-30 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r md:block" />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Phones have no sidebar, so they get a small header with the title, bell and user. */}
          <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur md:hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <Link
                href="/"
                className="min-w-0 truncate text-base font-bold leading-tight"
              >
                Tri-Cities Chamber
              </Link>
              {data && (
                <div className="ml-auto flex items-center gap-2">
                  <OverdueBell />
                  <div className="w-36">
                    <UserSelect />
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
            {children}
          </div>

          <footer className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 pb-24 text-xs text-muted-foreground sm:px-6 md:pb-8 lg:px-8">
            <span>Demo data is saved in this browser only.</span>
            {data && (
              <span className="flex items-center gap-4">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto gap-1 p-0 text-xs text-muted-foreground"
                  onClick={downloadBackup}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Download backup
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground"
                  onClick={() => {
                    data.resetDemoData();
                    toast({ title: "Demo data reset" });
                  }}
                >
                  Reset demo data
                </Button>
              </span>
            )}
          </footer>
        </div>

        <ReminderToasts />

        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      </div>
    </HomeFiltersProvider>
  );
}

/** The menu stuck to the bottom of the screen. Only shown on phones. */
function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active && "text-primary",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
