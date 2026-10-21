import type { Metadata } from "next";
import { AdvertisingView } from "@/features/sponsorships/views/advertising-view";

// Always read fresh data from Supabase; nothing here should be statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Advertising | Sponsorships" };

export default function Page() {
  return <AdvertisingView />;
}
