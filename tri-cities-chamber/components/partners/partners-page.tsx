"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, Plus, Search } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { amountPaid, formatCurrency } from "@/lib/planner/contracts";

/**
 * The partners page (/partners). Each partner shows contact details, the
 * contracts they signed (linked to their pages), and the money total vs
 * received. The search box looks at partner and contact names.
 */
export function PartnersPage() {
  const data = usePlannerData();
  const [query, setQuery] = useState("");

  const partners = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.sponsors
      .filter((s) => !q || [s.name, s.contactName].join(" ").toLowerCase().includes(q))
      .map((s) => {
        const contracts = data.contracts.filter((c) => c.sponsorId === s.id);
        return {
          sponsor: s,
          contracts,
          total: contracts.reduce((n, c) => n + c.amount, 0),
          received: contracts.reduce((n, c) => n + amountPaid(c), 0),
        };
      })
      .sort((a, b) => a.sponsor.name.localeCompare(b.sponsor.name));
  }, [data.sponsors, data.contracts, query]);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">Partners</h1>
          <p className="text-sm text-muted-foreground">
            Sponsors, who to contact, and everything they have signed.
          </p>
        </div>
        <Button asChild>
          <Link href="/contracts/new">
            <Plus />
            <span>
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New contract</span>
            </span>
          </Link>
        </Button>
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search partners"
          aria-label="Search partners"
          className="pl-9"
        />
      </div>

      {partners.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No partners match.
        </p>
      ) : (
        <ul className="grid gap-3">
          {partners.map(({ sponsor, contracts, total, received }) => (
            <li key={sponsor.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{sponsor.name}</h2>
                  {sponsor.contactName && (
                    <p className="text-sm text-muted-foreground">{sponsor.contactName}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                    {sponsor.contactEmail && (
                      <a
                        href={`mailto:${sponsor.contactEmail}`}
                        className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden />
                        {sponsor.contactEmail}
                      </a>
                    )}
                    {sponsor.contactPhone && (
                      <a
                        href={`tel:${sponsor.contactPhone}`}
                        className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden />
                        {sponsor.contactPhone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(total)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(received)} received
                  </div>
                </div>
              </div>

              {contracts.length > 0 ? (
                <ul aria-label={`Contracts with ${sponsor.name}`} className="mt-3 grid gap-1 border-t pt-3">
                  {contracts.map((c) => {
                    const event = c.eventId ? data.lookups.eventsById.get(c.eventId) : undefined;
                    return (
                      <li key={c.id} className="flex justify-between gap-3 text-sm">
                        <Link
                          href={`/contracts/${c.id}`}
                          className="min-w-0 truncate underline-offset-2 hover:underline"
                        >
                          {c.title}
                          {event && <span className="text-muted-foreground">, {event.name}</span>}
                        </Link>
                        <span className="shrink-0 text-muted-foreground">
                          {formatCurrency(c.amount)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">No contracts yet.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
