"use client";

/*
 * DASHBOARD PAGE (shown at /home). Build the page in the JSX below and style it yourself.
 * Make its parts in components/dashboard/. Guide: docs/PAGE_STARTER_GUIDE.md
 */

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { getTasksPerDay, getUploadedDocuments } from "@/lib/planner/dashboard";
import { CardInfo } from "./cardInfo";
import { UpcomingDueDates } from "./upcoming-due-dates";
import { UploadedDocuments } from "./UploadedDocument";
import { DueDates } from "./duedates";
import { DashboardHeader } from "./dashboard-header";

export function DashboardPage() {
  const data = usePlannerData();
  const days = getTasksPerDay(data.tasks, data.today);
  const docs = getUploadedDocuments(data.contracts);
  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader
        title="Tu Do Dashboard"
        subtitle="A clear view of due dates across your events and projects."
      />
      <div className="flex w-fit max-w-full overflow-x-auto rounded-lg border bg-card text-card-foreground">
        <CardInfo title="Tasks" trackerData={data.tasks.length} />
        <CardInfo title="Events" trackerData={data.events.length} />
        <CardInfo title="Sponsors" trackerData={data.sponsors.length} />
      </div>
      <DueDates days={days} />
      <UploadedDocuments docs={docs} />
      <UpcomingDueDates />
    </div>
  );
}
