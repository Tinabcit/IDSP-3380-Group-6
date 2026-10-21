import type { ReactNode } from "react";
import { SponsorshipNav } from "@/features/sponsorships/components/sponsorship-nav";

export default function SponsorshipSandboxLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sponsorships</h1>
        <SponsorshipNav />
      </header>
      <main>{children}</main>
    </div>
  );
}
