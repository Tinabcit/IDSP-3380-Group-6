import { DataGate } from "@/components/app-shell/planner-provider";
import { SandboxPage } from "@/components/sandbox/sandbox-page";
import { TodoPage } from "@/components/todo/todo-page";

export const metadata = { title: "To-do | Tri-Cities Chamber" };

/** Page at /todo. Only the to-do list. */
export default function Page() {
  return (
    <SandboxPage>
      <DataGate>
        <TodoPage />
      </DataGate>
    </SandboxPage>
  );
}
