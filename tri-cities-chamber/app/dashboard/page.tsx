import { DataGate } from "@/components/app-shell/planner-provider";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

/**
 * Page at "/dashboard". Shows the due date overview, uploaded documents and task lists.
 * DataGate waits until the data has loaded before showing it.
 */
export default function Dashboard() {
  return (
    <DataGate>
      <DashboardPage />
    </DataGate>
  );
}
