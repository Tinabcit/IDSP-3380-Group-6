import { DataGate } from "@/components/app-shell/planner-provider";
import { AddEventPage } from "@/components/events/add-event-page";

export const metadata = { title: "Add Event | Tri-Cities Chamber" };

/** Page at /events/new. The full-page form for adding an event. */
export default function Page() {
  return (
    <DataGate>
      <AddEventPage />
    </DataGate>
  );
}
