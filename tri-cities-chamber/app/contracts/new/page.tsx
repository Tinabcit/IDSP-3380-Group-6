import { DataGate } from "@/components/app-shell/planner-provider";
import { ContractForm } from "@/components/contracts/contract-form";

export const metadata = { title: "New contract | Tri-Cities Chamber" };

export default function Page() {
  return (
    <DataGate>
      <ContractForm />
    </DataGate>
  );
}
