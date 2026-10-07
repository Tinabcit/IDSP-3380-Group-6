"use client";

import { useEffect, useMemo, useRef } from "react";
import { addMonths, format, isSameMonth } from "date-fns";

import {
  WEEK_STARTS_ON,
  fromISODate,
  getMonthGrid,
  getWeekdayLabels,
  shiftISODate,
  toISODate,
} from "@/lib/planner/dates";
import type { DaySummary } from "@/lib/planner/selectors";
import type { ISODate } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

interface MonthGridProps {
  month: Date;
  today: ISODate;
  selectedDate: ISODate;
  summaries: Map<ISODate, DaySummary>;
  onSelectDate: (date: ISODate) => void;
  /** Bumped by the parent when keyboard navigation should move focus. */
  focusKey: number;
  onKeyboardNavigate: (date: ISODate) => void;
}

/** The weekday names (Sun, Mon, ...), worked out once. */
const WEEKDAYS = getWeekdayLabels();

/**
 * The month calendar. Draws one DayCell for every day.
 * You can use it with the keyboard (arrow keys, Home/End, PageUp/PageDown).
 * It only draws things; PlannerApp works out what each day contains.
 */
export function MonthGrid({
  month,
  today,
  selectedDate,
  summaries,
  onSelectDate,
  focusKey,
  onKeyboardNavigate,
}: MonthGridProps) {
  const days = useMemo(() => getMonthGrid(month), [month]);
  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [days]);

  const cellRefs = useRef(new Map<ISODate, HTMLButtonElement>());

  // Roving tabindex: the selected day if visible, otherwise the 1st of the month.
  const tabbableDate = useMemo(() => {
    const inView = days.some(
      (d) => toISODate(d) === selectedDate && isSameMonth(d, month)
    );
    return inView ? selectedDate : toISODate(month);
  }, [days, month, selectedDate]);

  useEffect(() => {
    if (focusKey === 0) return;
    cellRefs.current.get(selectedDate)?.focus();
  }, [focusKey, selectedDate]);

  /**
   * Runs when a key is pressed on a day. Works out which day the key should
   * move to (e.g. ArrowRight = next day), then tells the parent to go there.
   */
  function handleKeyDown(event: React.KeyboardEvent, date: ISODate) {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    let next: ISODate | null = null;
    if (event.key in moves) {
      next = shiftISODate(date, moves[event.key]);
    } else if (event.key === "Home" || event.key === "End") {
      const offset = (fromISODate(date).getDay() - WEEK_STARTS_ON + 7) % 7;
      next = shiftISODate(date, event.key === "Home" ? -offset : 6 - offset);
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      const delta = event.key === "PageUp" ? -1 : 1;
      next = toISODate(addMonths(fromISODate(date), delta));
    }
    if (next) {
      event.preventDefault();
      onKeyboardNavigate(next);
    }
  }

  return (
    <div
      role="grid"
      aria-label={format(month, "MMMM yyyy")}
      className="overflow-hidden rounded-lg border bg-card"
    >
      <div role="row" className="grid grid-cols-7 border-b bg-muted/60">
        {WEEKDAYS.map((day) => (
          <div
            key={day.long}
            role="columnheader"
            aria-label={day.long}
            className="py-2 text-center text-xs font-semibold text-muted-foreground"
          >
            <span aria-hidden className="sm:hidden">
              {day.short}
            </span>
            <span aria-hidden className="hidden sm:inline">
              {day.long.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>

      {weeks.map((week) => (
        <div
          role="row"
          key={toISODate(week[0])}
          className="grid grid-cols-7 border-b last:border-b-0"
        >
          {week.map((day) => {
            const iso = toISODate(day);
            return (
              <DayCell
                key={iso}
                date={day}
                iso={iso}
                inMonth={isSameMonth(day, month)}
                isToday={iso === today}
                isSelected={iso === selectedDate}
                isTabbable={iso === tabbableDate}
                summary={summaries.get(iso)}
                onSelect={onSelectDate}
                onKeyDown={handleKeyDown}
                registerRef={(el) => {
                  if (el) cellRefs.current.set(iso, el);
                  else cellRefs.current.delete(iso);
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** The information one DayCell needs. */
interface DayCellProps {
  date: Date;
  iso: ISODate;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isTabbable: boolean;
  summary?: DaySummary;
  onSelect: (date: ISODate) => void;
  onKeyDown: (event: React.KeyboardEvent, date: ISODate) => void;
  registerRef: (el: HTMLButtonElement | null) => void;
}

/**
 * Builds the sentence a screen reader reads for a day,
 * e.g. "Friday, March 7. Signature event: Gala. 2 overdue".
 */
function describeDay(date: Date, summary?: DaySummary): string {
  const parts = [format(date, "EEEE, MMMM d")];
  if (!summary) return parts[0];
  const signature = summary.events.filter((e) => e.isSignature);
  const regular = summary.events.filter((e) => !e.isSignature);
  if (signature.length)
    parts.push(`Signature event: ${signature.map((e) => e.name).join(", ")}`);
  if (regular.length)
    parts.push(
      `${regular.length} other event${regular.length > 1 ? "s" : ""}`
    );
  if (summary.overdue) parts.push(`${summary.overdue} overdue`);
  if (summary.pending) parts.push(`${summary.pending} to do`);
  if (summary.completed) parts.push(`${summary.completed} done`);
  return parts.join(". ");
}

/**
 * One day box in the calendar: the date number, the signature ribbon, and
 * either small coloured dots (phone) or event names and task counts (bigger screens).
 */
function DayCell({
  date,
  iso,
  inMonth,
  isToday,
  isSelected,
  isTabbable,
  summary,
  onSelect,
  onKeyDown,
  registerRef,
}: DayCellProps) {
  const events = summary?.events ?? [];
  const hasSignature = events.some((e) => e.isSignature);
  const openTasks = (summary?.pending ?? 0) + (summary?.overdue ?? 0);
  const allDone = !openTasks && (summary?.completed ?? 0) > 0;

  return (
    <div
      role="gridcell"
      aria-selected={isSelected}
      className="border-r last:border-r-0"
    >
      <button
        ref={registerRef}
        type="button"
        tabIndex={isTabbable ? 0 : -1}
        aria-label={describeDay(date, summary)}
        aria-current={isToday ? "date" : undefined}
        onClick={() => onSelect(iso)}
        onKeyDown={(e) => onKeyDown(e, iso)}
        className={cn(
          "relative flex h-14 w-full flex-col items-center gap-1 px-1 pb-1 pt-2 text-left transition-colors sm:h-28 sm:items-stretch sm:px-1.5",
          "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          inMonth ? "hover:bg-muted/70" : "bg-muted/30 text-muted-foreground/60",
          isSelected && "bg-secondary hover:bg-secondary"
        )}
      >
        {/* Signature event ribbon: the calendar's one bold mark. */}
        {hasSignature && (
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1.5 bg-signature"
          />
        )}

        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm tabular-nums",
            isToday && "bg-primary font-bold text-primary-foreground",
            isSelected && !isToday && "font-bold text-primary ring-2 ring-primary"
          )}
        >
          {format(date, "d")}
        </span>

        {/* Phone: compact markers. */}
        <span aria-hidden className="flex items-center gap-0.5 sm:hidden">
          {summary?.overdue ? (
            <span className="h-1.5 w-1.5 rounded-full bg-overdue" />
          ) : null}
          {summary?.pending ? (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          ) : null}
          {allDone ? (
            <span className="h-1.5 w-1.5 rounded-full bg-done" />
          ) : null}
          {events.some((e) => !e.isSignature) ? (
            <span className="h-1.5 w-1.5 rounded-sm bg-muted-foreground/60" />
          ) : null}
        </span>

        {/* Tablet and up: event names and task counts. */}
        <span aria-hidden className="hidden min-w-0 flex-col gap-0.5 sm:flex">
          {events.slice(0, 2).map((event) => (
            <span
              key={event.id}
              className={cn(
                "truncate rounded px-1 py-0.5 text-[11px] font-medium leading-tight",
                event.isSignature
                  ? "bg-signature-soft text-signature-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {event.name}
            </span>
          ))}
          {events.length > 2 && (
            <span className="px-1 text-[11px] text-muted-foreground">
              +{events.length - 2} more
            </span>
          )}
          {(openTasks > 0 || allDone) && (
            <span className="mt-auto flex gap-1.5 px-1 text-[11px] leading-tight">
              {summary?.overdue ? (
                <span className="font-semibold text-overdue">
                  {summary.overdue} overdue
                </span>
              ) : null}
              {summary?.pending ? (
                <span className="text-foreground">
                  {summary.pending} to do
                </span>
              ) : null}
              {allDone ? <span className="text-done">All done</span> : null}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
