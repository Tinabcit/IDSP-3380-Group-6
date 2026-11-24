/*
 * PART of the dashboard: one number with a label.
 * Guide: docs/PAGE_STARTER_GUIDE.md
 */

/** TYPES (already set up): the props this part takes. To add a prop, add a line here. */
type CardInfoProps = {
  headingText: string;
  numberInfo: number;
};

/** A small stat: a muted label with a big number under it. Adds a divider on the left of all but the first. */
export function CardInfo({ headingText, numberInfo }: CardInfoProps) {
  return (
    <div className="flex w-44 shrink-0 flex-col gap-2 border-l p-4 first:border-l-0">
      <p className="text-xs text-muted-foreground">{headingText}</p>
      <p className="text-2xl font-semibold leading-none">{numberInfo}</p>
    </div>
  );
}
