"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Download, FileText, Handshake, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useOptionalPlannerData } from "./planner-provider";

const NAV = [
  { href: "/", label: "Calendar", icon: CalendarDays },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/events", label: "Events", icon: Star },
  { href: "/partners", label: "Partners", icon: Handshake },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const data = useOptionalPlannerData();

  function downloadBackup() {
    if (!data) return;
    const blob = new Blob([data.exportBackup(data.today)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chamber-backup-${data.today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold sm:text-lg">
              Tri-Cities Chamber
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Contracts, events and reminders
            </span>
          </Link>

          <Suspense fallback={null}>
            <DesktopNav />
          </Suspense>

          {data && (
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Signed in as
              </span>
              <Select value={data.currentUserId} onValueChange={data.setCurrentUser}>
                <SelectTrigger aria-label="Signed in as" className="h-9 w-auto gap-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.staff.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              onClick={data.resetDemoData}
            >
              Reset demo data
            </Button>
          </span>
        )}
      </footer>

      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}

function DesktopNav() {
  const pathname = usePathname();
  return (
  <nav aria-label="Main" className="ml-4 hidden gap-1 md:flex">
    {NAV.map(({ href, label, icon: Icon }) => {
      const active = isActive(pathname, href);
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active && "bg-secondary text-secondary-foreground"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </Link>
      );
    })}
  </nav>
  );
}

function MobileNav() {
  const pathname = usePathname();
  return (
  <nav
    aria-label="Main"
    className="fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
  >
    <ul className="grid grid-cols-4">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                active && "text-primary"
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
