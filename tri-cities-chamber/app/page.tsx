import { DataGate } from "@/components/app-shell/planner-provider";
import { PlannerApp } from "@/components/planner/planner-app";

/**
 * Page at "/" (the home page). Shows the calendar and to-do list.
 * DataGate waits until the data has loaded before showing it.
 */
export default function Home() {
  return (
    <DataGate>
      <PlannerApp />
    </DataGate>
  );
}
