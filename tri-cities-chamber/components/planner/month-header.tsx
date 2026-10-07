"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MonthHeaderProps {
  month: Date;
  isCurrentMonth: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthHeader({
  month,
  isCurrentMonth,
  onPrevious,
  onNext,
  onToday,
}: MonthHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
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
