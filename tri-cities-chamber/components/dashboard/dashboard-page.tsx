"use client";

/*
 * DASHBOARD PAGE (shown at /dashboard). Build the page in the JSX below and style it yourself.
 * Make its parts in components/dashboard/. Guide: docs/PAGE_STARTER_GUIDE.md
 */

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { CardInfo } from "./cardInfo";

/** The dashboard: a summary of the app's data. */
export function DashboardPage() {
  // All the app's data (already typed): events, sponsors, contracts, tasks, staff, today...
  const data = usePlannerData();

  return (
    <div>
      <h1>Dashboard</h1>
      {/* TODO: build the page */}
      <CardInfo headingText="Tasks" numberInfo={data.tasks.length} />
      <CardInfo headingText="Events" numberInfo={data.events.length} />
      <CardInfo headingText="Sponsors" numberInfo={data.sponsors.length} />
    </div>
  );
}
