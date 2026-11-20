import { DataGate } from "@/components/app-shell/planner-provider";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

export const metadata = { title: "Home | Tri-Cities Chamber" };

/*
 * Page at /home. You normally do not need to change this file:
 * the page itself is components/dashboard/dashboard-page.tsx.
 */
export default function Page() {
  return (
    <DataGate>
      <DashboardPage />
    </DataGate>
  );
}
