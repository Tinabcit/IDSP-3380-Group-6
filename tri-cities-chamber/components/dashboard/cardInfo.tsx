/** A small stat card: a label on top and a number below. Uses theme colours so it reads in light and dark mode. */
export function CardInfo({ headingText, numberInfo }: { headingText: string; numberInfo: number }) {
  return (
    <div className="w-36 rounded-xl border bg-card px-3.5 py-3">
      <p className="text-[9px] text-muted-foreground">{headingText}</p>

      <p className="mt-1 text-base font-semibold text-foreground">{numberInfo}</p>
    </div>
  );
}
