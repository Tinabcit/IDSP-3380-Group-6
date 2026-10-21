import type { Metadata } from "next";
import { TicketsView } from "@/features/sponsorships/views/tickets-view";

// Always read fresh data from Supabase; nothing here should be statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tickets | Sponsorships" };

export default function Page() {
  return <TicketsView />;
}
