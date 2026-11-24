"use client";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/app-shell/toast-provider";
import type { CompTicket } from "@/components/partners/give-comp-tickets-dialog";
import {
  createSponsorCompTicketAction,
  deleteSponsorCompTicketAction,
  loadSponsorCompTicketsAction,
} from "@/lib/db/actions";

/**
 * The comp tickets made with "Give Comp Tickets" on the Partners page, kept in
 * the sponsor_comp_tickets table. Works like the planner store: the screen
 * updates first, then the change is saved; if the save fails the list is
 * reloaded from the database and an error toast is shown.
 */
export function useSponsorCompTickets() {
  const toast = useToast();
  const [tickets, setTickets] = useState<CompTicket[]>([]);

  /** Replaces the list with what is saved in the database. */
  const reload = useCallback(
    () =>
      loadSponsorCompTicketsAction().then(setTickets, () =>
        toast({ kind: "error", title: "Could not load comp tickets" })
      ),
    [toast]
  );

  // Load once when the page opens.
  useEffect(() => {
    let live = true;
    loadSponsorCompTicketsAction().then(
      (saved) => {
        if (live) setTickets(saved);
      },
      () => toast({ kind: "error", title: "Could not load comp tickets" })
    );
    return () => {
      live = false;
    };
  }, [toast]);

  /** Runs a save; on failure, shows an error and puts the list back to what is saved. */
  const save = useCallback(
    (work: Promise<void>) => {
      work.catch(() => {
        toast({ kind: "error", title: "Could not save comp tickets", description: "Your last change was undone." });
        void reload();
      });
    },
    [reload, toast]
  );

  const addTicket = useCallback(
    (ticket: CompTicket) => {
      setTickets((previous) => [...previous, ticket]);
      save(createSponsorCompTicketAction(ticket));
    },
    [save]
  );

  const removeTicket = useCallback(
    (id: string) => {
      setTickets((previous) => previous.filter((item) => item.id !== id));
      save(deleteSponsorCompTicketAction(id));
    },
    [save]
  );

  return { tickets, addTicket, removeTicket };
}
