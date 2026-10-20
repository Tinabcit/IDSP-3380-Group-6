import { DataGate } from "@/components/app-shell/planner-provider";
import { HomePage } from "@/components/home/home-page";

/**
 * Page at "/" (the home page). Shows the to-do task table with the sidebar.
 * DataGate waits until the data has loaded before showing it.
 */
export default function Home() {
  return (
    <DataGate>
      <HomePage />
    </DataGate>
  );
}
