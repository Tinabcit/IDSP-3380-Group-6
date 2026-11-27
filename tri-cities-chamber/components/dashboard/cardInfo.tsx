/*
 * PART of the dashboard: one number with a label.
 * Guide: docs/PAGE_STARTER_GUIDE.md
 */

/** TYPES (already set up): the props this part takes. To add a prop, add a line here. */
type CardInfoProps = {
  title?: string | null ;
  trackerData?: number | string | null;
  fallback?: string | null;
  className?: string | null;
};

export type CardInfoItems = Pick <CardInfoProps, "title" | "trackerData">  

/** A small stat: a muted label with a big number under it. Adds a divider on the left of all but the first. */
export function CardInfo({ title, trackerData, fallback, className }: CardInfoProps) {
  return (
  <div className="flex w-fit max-w-full overflow-x-auto rounded-lg border bg-card text-card-foreground">      
   <div className="flex w-44 shrink-0 flex-col gap-2 border-l p-4 first:border-l-0">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold leading-none">{trackerData || fallback}</p>
    </div>
      
      </div>
  );
}
