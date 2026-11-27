"use client";

/*
 * DASHBOARD PAGE (shown at /home). Build the page in the JSX below and style it yourself.
 * Make its parts in components/dashboard/. Guide: docs/PAGE_STARTER_GUIDE.md
 */

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { getTasksPerDay, getUploadedDocuments } from "@/lib/planner/dashboard";
import { CardInfoGroup } from "./cardInfo";
import { UpcomingDueDates } from "./upcoming-due-dates";
import { UploadedDocuments } from "./UploadedDocument";
import { DueDates } from "./duedates";
import { DashboardHeader } from "./dashboard-header";
import "./dashboard-page.css";



export function DashboardPage() {
  const data = usePlannerData();
  const days = getTasksPerDay(data.tasks, data.today);
  const docs = getUploadedDocuments(data.contracts);

    const stats=[
          { title: "Tasks", trackerData: data.tasks.length },
          { title: "Events", trackerData: data.events.length },
          { title: "Sponsors", trackerData: data.sponsors.length },
        ]
  return (
    <div className="dashboard-page">
      <DashboardHeader
        title="Tu Do Dashboard"
        subtitle="A clear view of due dates across your events and projects."
      />
      <CardInfoGroup items = {stats}
      />
      <DueDates days={days} />
      <UploadedDocuments docs={docs} />
      <UpcomingDueDates />
    </div>
  );
}
