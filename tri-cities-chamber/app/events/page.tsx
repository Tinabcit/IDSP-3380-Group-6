import { DataGate } from "@/components/app-shell/planner-provider";
import { EventsPage } from "@/components/events/events-page";

export const metadata = { title: "Events | Tri-Cities Chamber" };

export default function Page() {
  return (
    <DataGate>
      <EventsPage />
    </DataGate>
  );
}
