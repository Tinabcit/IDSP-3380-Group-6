import { DataGate } from "@/components/app-shell/planner-provider";
import { PartnersPage } from "@/components/partners/partners-page";

export const metadata = { title: "Partners | Tri-Cities Chamber" };

/** Page at /partners. Shows the list of partners (sponsors). */
export default function Page() {
  return (
    <DataGate>
      <PartnersPage />
    </DataGate>
  );
}
