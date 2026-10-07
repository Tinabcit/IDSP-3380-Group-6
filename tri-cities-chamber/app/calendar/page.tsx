import { DataGate } from "@/components/app-shell/planner-provider";
import { CalendarPage } from "@/components/calendar/calendar-page";
import { SandboxPage } from "@/components/sandbox/sandbox-page";

export const metadata = { title: "Calendar | Tri-Cities Chamber" };

/** Page at /calendar. Only the calendar. */
export default function Page() {
  return (
    <SandboxPage>
      <DataGate>
        <CalendarPage />
      </DataGate>
    </SandboxPage>
  );
}
