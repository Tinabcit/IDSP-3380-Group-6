import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { humanize } from "../lib/format";
import { STATUS_TONE, TONE_BADGE } from "../lib/tones";

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = STATUS_TONE[value] ?? "muted";
  return (
    <Badge
      variant="outline"
      className={cn("whitespace-nowrap font-medium", TONE_BADGE[tone], className)}
    >
      {humanize(value)}
    </Badge>
  );
}
