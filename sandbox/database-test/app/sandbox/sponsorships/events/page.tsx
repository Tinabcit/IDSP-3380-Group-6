import type { Metadata } from "next";
import { EventsView } from "@/features/sponsorships/views/events-view";

// Always read fresh data from Supabase; nothing here should be statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Events | Sponsorships" };

export default function Page() {
  return <EventsView />;
}
