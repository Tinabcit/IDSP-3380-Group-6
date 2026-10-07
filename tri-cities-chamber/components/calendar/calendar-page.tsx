'use client';

import { useCallback, useMemo, useState } from 'react';
import { addMonths, isSameMonth, startOfMonth } from 'date-fns';
import { MapPin } from 'lucide-react';

import { usePlannerData } from '@/components/app-shell/planner-provider';
import { FilterBar } from '@/components/planner/filter-bar';
import { MonthGrid } from '@/components/planner/month-grid';
import { MonthHeader } from '@/components/planner/month-header';
import { Badge } from '@/components/ui/badge';
import { formatLongDate, fromISODate, getMonthGrid, toISODate } from '@/lib/planner/dates';
import { eventsOnDate, filterEvents, filterTasks, summarizeByDate } from '@/lib/planner/selectors';
import { EMPTY_FILTERS, type ISODate, type PlannerFilters } from '@/lib/planner/types';
import { cn } from '@/lib/utils';

/**
 * The calendar page ("/calendar") - the calendar ONLY. No to-do list here.
 * Shows filters, the month grid, a colour key and the events of the selected day.
 * (Task dots still appear on the grid days; managing tasks is on /todo.)
 */
export function CalendarPage() {
  const store = usePlannerData();
  const { today, lookups } = store;

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(fromISODate(today)));
  const [selectedDate, setSelectedDate] = useState<ISODate>(today);
  const [focusKey, setFocusKey] = useState(0);
  const [filters, setFilters] = useState<PlannerFilters>(EMPTY_FILTERS);

  const visibleEvents = useMemo(
    () => filterEvents(store.events, filters, store.tasks),
    [store.events, store.tasks, filters],
  );
  const visibleTasks = useMemo(
    () => filterTasks(store.tasks, filters, lookups.eventsById),
    [store.tasks, filters, lookups.eventsById],
  );
  const summaries = useMemo(() => {
    const dates = getMonthGrid(viewMonth).map(toISODate);
    return summarizeByDate(visibleEvents, visibleTasks, dates, today);
  }, [viewMonth, visibleEvents, visibleTasks, today]);
  const dayEvents = useMemo(() => eventsOnDate(visibleEvents, selectedDate), [visibleEvents, selectedDate]);

  /** Selects a day. If it is in a different month, the calendar jumps to that month. */
  const selectDate = useCallback((date: ISODate) => {
    setSelectedDate(date);
    setViewMonth((current) => {
      const d = fromISODate(date);
      return isSameMonth(d, current) ? current : startOfMonth(d);
    });
  }, []);

  /** Arrow-key navigation: selects the new day and moves keyboard focus to it. */
  const navigateWithKeyboard = useCallback(
    (date: ISODate) => {
      selectDate(date);
      setFocusKey((k) => k + 1);
    },
    [selectDate],
  );

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="text-xl font-bold leading-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">Events and due dates</p>
      </header>

      <FilterBar filters={filters} pillars={store.pillars} sponsors={store.sponsors} onChange={setFilters} />
      <MonthHeader
        month={viewMonth}
        isCurrentMonth={isSameMonth(viewMonth, fromISODate(today)) && selectedDate === today}
        onPrevious={() => setViewMonth((m) => addMonths(m, -1))}
        onNext={() => setViewMonth((m) => addMonths(m, 1))}
        onToday={() => selectDate(today)}
      />
      <MonthGrid
        month={viewMonth}
        today={today}
        selectedDate={selectedDate}
        summaries={summaries}
        onSelectDate={selectDate}
        focusKey={focusKey}
        onKeyboardNavigate={navigateWithKeyboard}
      />
      <Legend />

      <section aria-labelledby="day-events-heading" className="grid gap-2">
        <h2 id="day-events-heading" className="text-lg font-bold">
          {selectedDate === today ? 'Today' : formatLongDate(selectedDate)}
        </h2>
        {dayEvents.length === 0 ? (
          <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No events on this day.
          </p>
        ) : (
          <ul aria-label="Events" className="grid gap-2">
            {dayEvents.map((event) => {
              const pillar = lookups.pillarsById.get(event.pillarId);
              return (
                <li
                  key={event.id}
                  className={cn(
                    'rounded-md px-3 py-2.5',
                    event.isSignature
                      ? 'bg-signature-soft text-signature-foreground'
                      : 'bg-secondary text-secondary-foreground',
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{event.name}</span>
                    {event.isSignature && (
                      <Badge className="bg-signature text-signature-foreground">Signature</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-[13px] opacity-80">
                    {pillar && <span>{pillar.name}</span>}
                    {event.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {event.location}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** The colour key (legend) under the calendar. Only displays things. */
function Legend() {
  return (
    <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-1.5 w-4 bg-signature" />
        Signature event
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2 w-2 rounded-sm bg-muted-foreground/60" />
        Other event
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-overdue" />
        Overdue
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
        To do
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-done" />
        All done
      </li>
    </ul>
  );
}
