import { SandboxPage } from "@/components/sandbox/sandbox-page";
import { DataGate } from "@/components/app-shell/planner-provider";
import { EventsPage } from "@/components/events/events-page";

export const metadata = { title: "Events | Tri-Cities Chamber" };

/** Page at /events. Shows the list of events and a button to add one. */
export default function Page() {
  return (
    <SandboxPage>
      <DataGate>
      <EventsPage />
    </DataGate>
    </SandboxPage>
  );
}
