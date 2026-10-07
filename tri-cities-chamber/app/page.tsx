import { DataGate } from "@/components/app-shell/planner-provider";
import { PlannerApp } from "@/components/planner/planner-app";

export default function Home() {
  return (
    <DataGate>
      <PlannerApp />
    </DataGate>
  );
}
