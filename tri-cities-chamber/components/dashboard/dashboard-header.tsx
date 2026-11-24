"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The dashboard's tabs. Each one is its own page. */
const TABS = [
  { href: "/home", label: "All tasks and events" },
  { href: "/home/archive", label: "Completed tasks" },
] as const;

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

// Shows a page title and subtitle, then the tab bar. The tab matching the current URL is underlined.
export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const pathname = usePathname();
  return (
    <header className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <nav aria-label="Dashboard sections" className="flex gap-6 border-b">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px border-b-2 pb-2 text-sm transition-colors ${
                isActive
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
