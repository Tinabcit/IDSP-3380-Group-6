"use client";

import { useOptionalPlannerData } from "@/components/app-shell/planner-provider";
import { CardInfo } from "@/components/dashboard/cardInfo";

/**
 * Page at /dashboard. Shows summary cards for tasks, events and sponsors.
 * The counts come from the shared planner data and show 0 until it has loaded.
 */
export default function Page() {
  const data = useOptionalPlannerData();

  return (
    <div className="flex flex-wrap gap-4 p-6">
      <div>
            <CardInfo headingText="Tasks" numberInfo={data?.tasks.length ?? 0} /> 
            <CardInfo headingText="Events" numberInfo={data?.events.length ?? 0} />
            <CardInfo headingText="Sponsors" numberInfo={data?.sponsors.length ?? 0} />
        </div>

    </div>
  );
}
