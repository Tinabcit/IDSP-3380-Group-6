import { Suspense } from "react";

import { DataGate } from "@/components/app-shell/planner-provider";
import { PlannerApp } from "@/components/planner/planner-app";

/**
 * Page at "/" (the home page). Shows the calendar and to-do list.
 * DataGate waits until the data has loaded before showing it. The Suspense
 * is needed because the calendar reads the "?date=" part of the URL.
 */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <DataGate>
        <PlannerApp />
      </DataGate>
    </Suspense>
  );
}
