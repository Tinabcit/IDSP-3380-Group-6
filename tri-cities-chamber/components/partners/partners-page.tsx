
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, Plus, Search, Ticket } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { useToast } from "@/components/app-shell/toast-provider";
import {
  SponsorFormDialog,
  type SponsorFormState,
} from "@/components/partners/sponsor-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { amountPaid, formatCurrency } from "@/lib/planner/contracts";
import { isDraft, levelLabel } from "@/lib/planner/sponsors";

import GiveCompTicketsDialog, {
  type CompTicket,
} from "@/components/partners/give-comp-tickets-dialog";

export function PartnersPage() {
  const data = usePlannerData();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [form, setForm] = useState<SponsorFormState | null>(null);

  const [showCompTickets, setShowCompTickets] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState("");
  const [compTickets, setCompTickets] = useState<CompTicket[]>([]);

  function openCompTickets(sponsorName: string) {
    setSelectedSponsor(sponsorName);
    setShowCompTickets(true);
  }

  function handleSaveCompTicket(ticket: CompTicket) {
    setCompTickets((previous) => [...previous, ticket]);

    toast({
      title:
        ticket.status === "Issued"
          ? "Comp tickets issued"
          : "Comp tickets saved",
      description: `${ticket.quantity} ticket(s) for ${ticket.sponsorName}`,
    });
  }

  function handleRemoveCompTicket(ticket: CompTicket) {
    setCompTickets((previous) =>
      previous.filter((item) => item.id !== ticket.id)
    );

    toast({
      title: "Comp tickets removed",
      description: ticket.sponsorName,
    });
  }

  const partners = useMemo(() => {
    const q = query.trim().toLowerCase();

    return data.sponsors
      .filter(
        (s) =>
          !q ||
          [s.name, s.contactName]
            .join(" ")
            .toLowerCase()
            .includes(q)
      )
      .map((s) => {
        const contracts = data.contracts.filter(
          (c) => c.sponsorId === s.id
        );

        return {
          sponsor: s,
          contracts,
          total: contracts.reduce((n, c) => n + c.amount, 0),
          received: contracts.reduce(
            (n, c) => n + amountPaid(c),
            0
          ),
        };
      })
      .sort((a, b) =>
        a.sponsor.name.localeCompare(b.sponsor.name)
      );
  }, [data.sponsors, data.contracts, query]);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">
            Partners
          </h1>

          <p className="text-sm text-muted-foreground">
            Sponsors, who to contact, and everything they have signed.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* New Give Comp Tickets button */}
          <Button
            variant="outline"
            onClick={() => openCompTickets("")}
          >
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">
              Give Comp Tickets
            </span>
            <span className="sm:hidden">
              Tickets
            </span>
          </Button>

          {/* Existing New Sponsor button */}
          <Button
            variant="outline"
            onClick={() => setForm({ mode: "create" })}
          >
            <Plus />
            <span>
              <span className="sm:hidden">Sponsor</span>
              <span className="hidden sm:inline">
                New sponsor
              </span>
            </span>
          </Button>

          {/* Existing New Contract button */}
          <Button asChild>
            <Link href="/contracts/new">
              <Plus />
              <span>
                <span className="sm:hidden">New</span>
                <span className="hidden sm:inline">
                  New contract
                </span>
              </span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Search partners */}
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
          {partners.map(
            ({ sponsor, contracts, total, received }) => (
              <li
                key={sponsor.id}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">
                        {sponsor.name}
                      </h2>

                      {isDraft(sponsor) && (
                        <Badge variant="outline">
                          Draft
                        </Badge>
                      )}

                      {sponsor.level && (
                        <Badge variant="secondary">
                          {levelLabel(sponsor.level)}
                        </Badge>
                      )}
                    </div>

                    {sponsor.contactName && (
                      <p className="text-sm text-muted-foreground">
                        {sponsor.contactName}
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                      {sponsor.contactEmail && (
                        <a
                          href={`mailto:${sponsor.contactEmail}`}
                          className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
                        >
                          <Mail
                            className="h-3.5 w-3.5"
                            aria-hidden
                          />
                          {sponsor.contactEmail}
                        </a>
                      )}

                      {sponsor.contactPhone && (
                        <a
                          href={`tel:${sponsor.contactPhone}`}
                          className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
                        >
                          <Phone
                            className="h-3.5 w-3.5"
                            aria-hidden
                          />
                          {sponsor.contactPhone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {/* Comp Tickets for this sponsor */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openCompTickets(sponsor.name)
                        }
                      >
                        <Ticket className="h-4 w-4" />
                        Comp Tickets
                      </Button>

                      {/* Existing Edit button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm({
                            mode: "edit",
                            sponsor,
                          })
                        }
                        aria-label={`Edit ${sponsor.name}`}
                      >
                        Edit
                      </Button>
                    </div>

                    <div className="font-semibold">
                      {formatCurrency(total)}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(received)} received
                    </div>
                  </div>
                </div>

                {/* Existing contracts */}
                {contracts.length > 0 ? (
                  <ul
                    aria-label={`Contracts with ${sponsor.name}`}
                    className="mt-3 grid gap-1 border-t pt-3"
                  >
                    {contracts.map((c) => {
                      const event = c.eventId
                        ? data.lookups.eventsById.get(c.eventId)
                        : undefined;

                      return (
                        <li
                          key={c.id}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <Link
                            href={`/contracts/${c.id}`}
                            className="min-w-0 truncate underline-offset-2 hover:underline"
                          >
                            {c.title}

                            {event && (
                              <span className="text-muted-foreground">
                                , {event.name}
                              </span>
                            )}
                          </Link>

                          <span className="shrink-0 text-muted-foreground">
                            {formatCurrency(c.amount)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                    No contracts yet.
                  </p>
                )}

                {/* Complimentary tickets */}
                {compTickets.some(
                  (ticket) =>
                    ticket.sponsorName === sponsor.name
                ) && (
                  <div className="mt-4 border-t pt-3">
                    <div className="mb-3 flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">
                        Complimentary Tickets
                      </h3>
                    </div>

                    <div className="grid gap-2">
                      {compTickets
                        .filter(
                          (ticket) =>
                            ticket.sponsorName === sponsor.name
                        )
                        .map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {ticket.ticketType}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {ticket.recipient ||
                                  "No recipient selected"}{" "}
                                · {ticket.quantity} ticket(s)
                              </p>

                              {ticket.eventName && (
                                <p className="text-xs text-muted-foreground">
                                  Event: {ticket.eventName}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {ticket.status}
                              </Badge>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveCompTicket(ticket)
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </li>
            )
          )}
        </ul>
      )}

      {/* Existing Sponsor Information dialog */}
      <SponsorFormDialog
        state={form}
        onClose={() => setForm(null)}
        onSubmit={(input, id) => {
          if (id) {
            data.updateSponsor(id, input);
          } else {
            data.addSponsor(input);
          }

          toast({
            title:
              input.status === "draft"
                ? "Sponsor saved as draft"
                : "Sponsor published",
            description: input.name,
          });
        }}
      />

      {/* Give Comp Tickets dialog */}
      <GiveCompTicketsDialog
        key={selectedSponsor}
        open={showCompTickets}
        onClose={() => setShowCompTickets(false)}
        onSave={handleSaveCompTicket}
        sponsorName={selectedSponsor}
      />
    </div>
  );
}

