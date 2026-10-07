import { SandboxPage } from "@/components/sandbox/sandbox-page";
import { DataGate } from "@/components/app-shell/planner-provider";
import { ContractsPage } from "@/components/contracts/contracts-page";

export const metadata = { title: "Contracts | Tri-Cities Chamber" };

/** Page at /contracts. Shows the list of all contracts. */
export default function Page() {
  return (
    <SandboxPage>
      <DataGate>
      <ContractsPage />
    </DataGate>
    </SandboxPage>
  );
}
