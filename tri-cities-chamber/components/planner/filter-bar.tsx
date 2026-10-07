"use client";

import { Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasActiveFilters } from "@/lib/planner/selectors";
import {
  EMPTY_FILTERS,
  type Pillar,
  type PlannerFilters,
  type Sponsor,
} from "@/lib/planner/types";
import { cn } from "@/lib/utils";

/** Special dropdown value that means "no filter" (the dropdown can't hold null). */
const ALL = "all";

/** The information FilterBar needs. */
interface FilterBarProps {
  filters: PlannerFilters;
  pillars: Pillar[];
  sponsors: Sponsor[];
  onChange: (filters: PlannerFilters) => void;
  label?: string;
}

/**
 * The row of filters: a "Signature events" button, a pillar dropdown, a sponsor
 * dropdown and a "Clear filters" button. It does not remember the filters itself;
 * the parent passes them in and gets told when they change.
 * Used on the calendar page and the contracts page.
 */
export function FilterBar({
  filters,
  pillars,
  sponsors,
  onChange,
  label = "Filter calendar",
}: FilterBarProps) {
  const active = hasActiveFilters(filters);

  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      <Button
        variant="outline"
        size="sm"
        aria-pressed={filters.signatureOnly}
        onClick={() =>
          onChange({ ...filters, signatureOnly: !filters.signatureOnly })
        }
        className={cn(
          "shrink-0",
          filters.signatureOnly &&
            "border-signature bg-signature-soft text-signature-foreground hover:bg-signature-soft"
        )}
      >
        <Star className={cn(filters.signatureOnly && "fill-current")} />
        Signature events
      </Button>

      <Select
        value={filters.pillarId ?? ALL}
        onValueChange={(v) =>
          onChange({ ...filters, pillarId: v === ALL ? null : v })
        }
      >
        <SelectTrigger
          aria-label="Pillar"
          className={cn(
            "h-9 w-auto shrink-0 gap-2",
            filters.pillarId && "border-primary"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All pillars</SelectItem>
          {pillars.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sponsorId ?? ALL}
        onValueChange={(v) =>
          onChange({ ...filters, sponsorId: v === ALL ? null : v })
        }
      >
        <SelectTrigger
          aria-label="Sponsor"
          className={cn(
            "h-9 w-auto shrink-0 gap-2",
            filters.sponsorId && "border-primary"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All sponsors</SelectItem>
          {sponsors.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="shrink-0 text-muted-foreground"
        >
          <X />
          Clear filters
        </Button>
      )}
    </div>
  );
}
