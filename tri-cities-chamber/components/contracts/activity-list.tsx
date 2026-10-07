import { formatDistanceToNow } from "date-fns";

import type { PlannerLookups } from "@/components/planner/lookups";
import type { ActivityEntry } from "@/lib/planner/types";

/**
 * A list of recent changes, like "Maria marked Deposit as paid, 2 hours ago".
 * Newest first. Turns the saved user id into a real name.
 * Used on the contracts page (latest 6) and the contract detail page (that contract only).
 */
export function ActivityList({
  entries,
  lookups,
}: {
  entries: ActivityEntry[];
  lookups: PlannerLookups;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No changes recorded yet.</p>;
  }
  return (
    <ul className="grid gap-2.5">
      {entries.map((entry) => (
        <li key={entry.id} className="text-sm">
          <span className="font-medium">
            {lookups.staffById.get(entry.userId)?.name ?? "Someone"}
          </span>{" "}
          {entry.message}
          <span className="block text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(entry.at), { addSuffix: true })}
          </span>
        </li>
      ))}
    </ul>
  );
}
