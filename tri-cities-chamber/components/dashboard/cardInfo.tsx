import { formatTrackerValue } from "@/lib/planner/dashboard";
import { cn } from "@/lib/utils";
import "./cardInfo.css";

type CardInfoProps = {
  title?: string | null;
  trackerData?: number | string | null;
  fallback?: string | null;
  className?: string | null;
};

const DEFAULT_HEADING = "Card Title";
const DEFAULT_FALLBACK = "-";

export type CardInfoItems = Pick<CardInfoProps, "title" | "trackerData">;

type CardInfoGroupProps = {
  items?: CardInfoItems[] | null;
  limit?: number;
  emptyText?: string;
};

export function CardInfo({ title, trackerData, fallback, className }: CardInfoProps) {
  return (
    <div className={cn("card-info", className)}>
      <p className="card-info__title">{title?.trim() || DEFAULT_HEADING}</p>
      <p className="card-info__value">
        {formatTrackerValue(trackerData, fallback ?? DEFAULT_FALLBACK)}
      </p>
    </div>
  );
}

export function CardInfoGroup({ items, limit, emptyText = "No stats to show." }: CardInfoGroupProps) {
  const shown = (items ?? []).slice(0, limit);

  if (shown.length === 0) {
    return <p className="card-info-group__empty">{emptyText}</p>;
  }

  return (
    <div className="card-info-group">
      {shown.map((item, index) => (
        <CardInfo key={`${item.title ?? "stat"}-${index}`} title={item.title} trackerData={item.trackerData} />
      ))}
    </div>
  );
}

// scoreBoard Component (array of objects)
// {
// foreach (array) {headingText, NumbericalData)}
// }

// CardInfo heaadingText {[headingText]}

// formattedData () {
//   return data.map()
// }

// <ScoreBoard data={formattedData}
