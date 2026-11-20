
import { DataGate } from "@/components/app-shell/planner-provider";
import { TasksPage } from "@/components/tasks/tasks-page";

/**
 * Page at "/tasks". Shows the to-do task table with the sidebar.
 * DataGate waits until the data has loaded before showing it.
 */
export default function Tasks() {
  return (
    <DataGate>
      <TasksPage />
    </DataGate>
  );
}
