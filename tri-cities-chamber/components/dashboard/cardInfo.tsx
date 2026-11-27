/*
 * PART of the dashboard: stat cards.
 * CardInfo is one stat. CardInfoGroup is the bordered strip that holds several of them.
 * Guide: docs/PAGE_STARTER_GUIDE.md
 */

import { formatTrackerValue } from "@/lib/planner/dashboard";
import { cn } from "@/lib/utils";

/** TYPES (already set up): the props this part takes. To add a prop, add a line here. */
type CardInfoProps = {
  title?: string | null;
  trackerData?: number | string | null;
  fallback?: string | null;
  className?: string | null;
};

const DEFAULT_HEADING = "Card Title";
const DEFAULT_FALLBACK = "-";

/** The part of a stat a group needs: its label and its value. */
export type CardInfoItems = Pick<CardInfoProps, "title" | "trackerData">;

type CardInfoGroupProps = {
  items?: CardInfoItems[] | null;
  /** Show at most this many stats. Leave out to show all of them. */
  limit?: number;
  emptyText?: string;
};

/** One stat: a muted label with a big number under it. Adds a divider on the left of all but the first. */
export function CardInfo({ title, trackerData, fallback, className }: CardInfoProps) {
  return (
    <div className={cn("flex w-44 shrink-0 flex-col gap-2 border-l p-4 first:border-l-0", className)}>
      <p className="text-xs text-muted-foreground">{title?.trim() || DEFAULT_HEADING}</p>
      <p className="text-2xl font-semibold leading-none">
        {formatTrackerValue(trackerData, fallback ?? DEFAULT_FALLBACK)}
      </p>
    </div>
  );
}

export function CardInfoGroup({ items, limit, emptyText = "No stats to show." }: CardInfoGroupProps) {
  const shown = (items ?? []).slice(0, limit);

  if (shown.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="flex w-fit max-w-full overflow-x-auto rounded-lg border bg-card text-card-foreground">
      {shown.map((item, index) => (
        <CardInfo key={`${item.title ?? "stat"}-${index}`} title={item.title} trackerData={item.trackerData} />
      ))}
    </div>
  );
}
