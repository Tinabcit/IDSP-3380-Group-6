"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { describeRelativeDay } from "@/lib/planner/dates";
import { overdueTasks } from "@/lib/planner/reminders";
import { cn } from "@/lib/utils";

import { useOptionalPlannerData } from "./planner-provider";

/** Most overdue tasks listed in the dropdown; the rest are reached with "View all overdue". */
const MAX_LISTED = 6;

/**
 * The bell in the top right of the header. The red badge counts overdue tasks;
 * clicking opens a list. Picking one task opens the calendar on its due date;
 * "View all overdue" opens the calendar at the "Coming up" list, which shows
 * every overdue task first.
 */
export function OverdueBell() {
  const data = useOptionalPlannerData();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const tasks = data?.tasks;
  const today = data?.today;
  const overdue = useMemo(() => (tasks && today ? overdueTasks(tasks, today) : []), [tasks, today]);

  // Close on Escape or when clicking anywhere outside the bell.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (!data || !today) return null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Overdue notifications, ${overdue.length} overdue`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {overdue.length > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-overdue px-1 text-[10px] font-bold leading-none text-white"
          >
            {overdue.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Overdue tasks"
          className="absolute right-0 top-11 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-md border bg-card p-2 text-card-foreground shadow-lg"
        >
          <p className="px-2 py-1 text-sm font-semibold">Overdue</p>
          {overdue.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">Nothing is overdue.</p>
          ) : (
            <>
              <ul className="grid gap-1">
                {overdue.slice(0, MAX_LISTED).map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/calendar?date=${t.dueDate}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-sm px-2 py-1.5 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <span className="block truncate text-sm font-medium">{t.title}</span>
                      <span className="block text-xs text-overdue">
                        {describeRelativeDay(t.dueDate, today)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/calendar#upcoming-heading"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-sm px-2 py-1.5 text-center text-sm font-medium text-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View all overdue ({overdue.length})
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
