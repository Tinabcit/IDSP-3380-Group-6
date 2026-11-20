import { DataGate } from "@/components/app-shell/planner-provider";
import { ArchivePage } from "@/components/dashboard/archive-page";

export const metadata = { title: "Archive | Tri-Cities Chamber" };

/*
 * Page at /home/archive. The page itself is components/dashboard/archive-page.tsx.
 */
export default function Page() {
  return (
    <DataGate>
      <ArchivePage />
    </DataGate>
  );
}
