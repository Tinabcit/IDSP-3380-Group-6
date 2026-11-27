"use client";

/*
 * DASHBOARD PAGE (shown at /dashboard). Build the page in the JSX below and style it yourself.
 * Make its parts in components/dashboard/. Guide: docs/PAGE_STARTER_GUIDE.md
 */

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { getTasksPerDay, getUploadedDocuments } from "@/lib/planner/dashboard";
import { CardInfo } from "./cardInfo";
import { UpcomingDueDates } from "./upcoming-due-dates";
import { UploadedDocuments } from "./UploadedDocument";

export function DashboardPage() {
  const data = usePlannerData();
  const days = getTasksPerDay(data.tasks, data.today);
  const docs = getUploadedDocuments(data.contracts);
  return (

    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">TUDO Dashboard</h1>
      <div className="flex w-fit max-w-full overflow-x-auto rounded-lg border bg-card text-card-foreground">
        <CardInfo headingText="Tasks" numberInfo={data.tasks.length} />
        <CardInfo headingText="Events" numberInfo={data.events.length} />
        <CardInfo headingText="Sponsors" numberInfo={data.sponsors.length} />
      </div>
      <UploadedDocuments docs={docs} />
      <UpcomingDueDates />
    </div>
  );
}
