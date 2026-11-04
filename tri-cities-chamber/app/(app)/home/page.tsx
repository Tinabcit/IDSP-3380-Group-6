import { DataGate } from "@/components/app-shell/planner-provider";
import { HomePage } from "@/components/home/home-page";

import TaskDetails from "@/components/TaskDetails";

/**
 * Page at "/home". Shows the to-do task table with the sidebar.
 * DataGate waits until the data has loaded before showing it.
 */
export default function Home() {
  return (
    <DataGate>
      <HomePage />
        <TaskDetails />
    </DataGate>
  );
}
