import { DataGate } from "@/components/app-shell/planner-provider";
import { PartnersPage } from "@/components/partners/partners-page";

export const metadata = { title: "Partners | Tri-Cities Chamber" };

export default function Page() {
  return (
    <DataGate>
      <PartnersPage />
    </DataGate>
  );
}
