import type { Metadata } from "next";
import { SponsorsView } from "@/features/sponsorships/views/sponsors-view";

// Always read fresh data from Supabase; nothing here should be statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sponsors | Sponsorships" };

export default function Page() {
  return <SponsorsView />;
}
