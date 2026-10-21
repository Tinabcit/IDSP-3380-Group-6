"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BASE_PATH } from "../lib/constants";

const LINKS = [
  { href: `${BASE_PATH}/events`, label: "Events" },
  { href: `${BASE_PATH}/sponsors`, label: "Sponsors" },
  { href: `${BASE_PATH}/advertising`, label: "Advertising" },
  { href: `${BASE_PATH}/tickets`, label: "Tickets" },
];

/** Styled like shadcn's TabsList, but each tab is a real route. */
export function SponsorshipNav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto" aria-label="Sponsorship views">
      <div className="inline-flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground">
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
