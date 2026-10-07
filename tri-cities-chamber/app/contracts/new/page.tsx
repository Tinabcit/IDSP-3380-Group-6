import { SandboxPage } from "@/components/sandbox/sandbox-page";
import { DataGate } from "@/components/app-shell/planner-provider";
import { ContractForm } from "@/components/contracts/contract-form";

export const metadata = { title: "New contract | Tri-Cities Chamber" };

/** Page at /contracts/new. Shows the form for adding a new contract. */
export default function Page() {
  return (
    <SandboxPage>
      <DataGate>
      <ContractForm />
    </DataGate>
    </SandboxPage>
  );
}
