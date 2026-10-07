import { DataGate } from "@/components/app-shell/planner-provider";
import { ContractsPage } from "@/components/contracts/contracts-page";

export const metadata = { title: "Contracts | Tri-Cities Chamber" };

export default function Page() {
  return (
    <DataGate>
      <ContractsPage />
    </DataGate>
  );
}
