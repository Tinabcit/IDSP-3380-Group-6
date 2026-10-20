"use client";

import { format, setMonth, setYear, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** The month names (January ... December), worked out once. */
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => format(new Date(2024, i, 1), "MMMM"));

/** How many years before and after the viewed year the year picker offers. */
const YEAR_SPAN = 5;

/** The information MonthHeader needs. */
interface MonthHeaderProps {
  month: Date;
  isCurrentMonth: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  /** Jumps straight to a month picked from the month or year dropdown. */
  onJump: (month: Date) => void;
}

/**
 * The title above the calendar (e.g. "March 2025") with the Today, previous and
 * next buttons. The actual month is stored in PlannerApp.
 */
export function MonthHeader({
  month,
  isCurrentMonth,
  onPrevious,
  onNext,
  onToday,
  onJump,
}: MonthHeaderProps) {
  const year = month.getFullYear();
  const years = Array.from({ length: YEAR_SPAN * 2 + 1 }, (_, i) => year - YEAR_SPAN + i);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2
        className="text-2xl font-bold tracking-tight sm:text-3xl"
        aria-live="polite"
      >
        {format(month, "MMMM")}{" "}
        <span className="font-light text-muted-foreground">
          {format(month, "yyyy")}
        </span>
      </h2>
      <div className="flex items-center gap-1">
        <Select
          value={String(month.getMonth())}
          onValueChange={(v) => onJump(startOfMonth(setMonth(month, Number(v))))}
        >
          <SelectTrigger aria-label="Choose month" className="h-8 w-[7.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, i) => (
              <SelectItem key={name} value={String(i)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(year)}
          onValueChange={(v) => onJump(startOfMonth(setYear(month, Number(v))))}
        >
          <SelectTrigger aria-label="Choose year" className="h-8 w-[5.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          disabled={isCurrentMonth}
          className="mr-1"
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          aria-label="Next month"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
