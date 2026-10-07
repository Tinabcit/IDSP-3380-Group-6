import { SandboxPage } from "@/components/sandbox/sandbox-page";
import { DataGate } from "@/components/app-shell/planner-provider";
import { PartnersPage } from "@/components/partners/partners-page";

export const metadata = { title: "Partners | Tri-Cities Chamber" };

/** Page at /partners. Shows the list of partners (sponsors). */
export default function Page() {
  return (
    <SandboxPage>
      <DataGate>
      <PartnersPage />
    </DataGate>
    </SandboxPage>
  );
}
