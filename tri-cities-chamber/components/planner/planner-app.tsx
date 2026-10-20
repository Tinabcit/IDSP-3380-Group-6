'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { addMonths, endOfMonth, isSameMonth, startOfMonth } from 'date-fns';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { usePlannerData } from '@/components/app-shell/planner-provider';
import { useToast } from '@/components/app-shell/toast-provider';
import { EventFormDialog, type EventFormState } from '@/components/events/event-form-dialog';
import { fromISODate, getMonthGrid, toISODate } from '@/lib/planner/dates';
import { isValidISODate } from '@/lib/planner/events';
import {
  eventsOnDate,
  filterEvents,
  filterTasks,
  hasActiveFilters,
  sortTasks,
  summarizeByDate,
  upcomingTasks,
} from '@/lib/planner/selectors';
import {
  EMPTY_FILTERS,
  type ChamberEvent,
  type EventInput,
  type ISODate,
  type PlannerFilters,
  type Task,
  type TaskInput,
} from '@/lib/planner/types';

import { DayPanel } from './day-panel';
import { FilterBar } from './filter-bar';
import { MonthGrid } from './month-grid';
import { MonthHeader } from './month-header';
import { TaskFormDialog, type TaskFormState } from './task-form-dialog';
import { UpcomingPanel } from './upcoming-panel';

/**
 * The calendar page ("/"). It is the "boss" of the calendar: it remembers the
 * month being viewed, the selected day, the filters and whether the task pop-up
 * is open. The data comes from usePlannerData().
 * How data flows:
 *   all data -> apply filters -> work out a summary for each day -> MonthGrid
 *   selected day's events and tasks -> DayPanel
 *   overdue + next 7 days tasks -> UpcomingPanel
 * The child components only show things. They get data and functions as props
 * and never change the data themselves.
 */
export function PlannerApp() {
  const store = usePlannerData();
  const { today, lookups } = store;
  const toast = useToast();
  const dateParam = useSearchParams().get('date');

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(fromISODate(today)));
  const [selectedDate, setSelectedDate] = useState<ISODate>(today);
  const [focusKey, setFocusKey] = useState(0);
  const [filters, setFilters] = useState<PlannerFilters>(EMPTY_FILTERS);
  const [formState, setFormState] = useState<TaskFormState | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Opening "/calendar?date=2025-03-07" (from the header bell) jumps to that day. This
  // adjusts state while rendering, once per new value of the URL.
  const [seenDateParam, setSeenDateParam] = useState<string | null>(null);
  if (dateParam !== seenDateParam) {
    setSeenDateParam(dateParam);
    if (dateParam && isValidISODate(dateParam)) {
      setSelectedDate(dateParam);
      setViewMonth(startOfMonth(fromISODate(dateParam)));
    }
  }

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

  // Events that touch the month on screen, so an empty month can say so.
  const monthEventCount = useMemo(() => {
    const first = toISODate(startOfMonth(viewMonth));
    const last = toISODate(endOfMonth(viewMonth));
    return visibleEvents.filter((e) => e.startDate <= last && e.endDate >= first).length;
  }, [viewMonth, visibleEvents]);

  const dayEvents = useMemo(() => eventsOnDate(visibleEvents, selectedDate), [visibleEvents, selectedDate]);
  const dayTasks = useMemo(
    () =>
      sortTasks(
        visibleTasks.filter((t) => t.dueDate === selectedDate),
        today,
      ),
    [visibleTasks, selectedDate, today],
  );
  const upcoming = useMemo(() => upcomingTasks(visibleTasks, today), [visibleTasks, today]);

  /** Selects a day. If it is in a different month, the calendar jumps to that month. */
  const selectDate = useCallback((date: ISODate) => {
    setSelectedDate(date);
    setViewMonth((current) => {
      const d = fromISODate(date);
      return isSameMonth(d, current) ? current : startOfMonth(d);
    });
  }, []);

  /**
   * Used when the arrow keys move between days: selects the new day and also moves
   * the keyboard focus to it (by increasing focusKey).
   */
  const navigateWithKeyboard = useCallback(
    (date: ISODate) => {
      selectDate(date);
      setFocusKey((k) => k + 1);
    },
    [selectDate],
  );

  /** The "Today" button: selects today (this also shows the current month). */
  const goToToday = useCallback(() => selectDate(today), [selectDate, today]);

  /** Ticks or unticks a task and announces it for screen readers. */
  const handleToggle = useCallback(
    (id: string) => {
      const task = store.tasks.find((t) => t.id === id);
      store.toggleTask(id);
      if (task) {
        setAnnouncement(task.completed ? `"${task.title}" marked as not done.` : `"${task.title}" marked as done.`);
        if (!task.completed) toast({ title: 'Task completed', description: task.title });
      }
    },
    [store, toast],
  );

  /** Deletes a task and announces it for screen readers. */
  const handleDelete = useCallback(
    (id: string) => {
      const task = store.tasks.find((t) => t.id === id);
      store.deleteTask(id);
      if (task) {
        setAnnouncement(`"${task.title}" deleted.`);
        toast({ title: 'Task deleted', description: task.title });
      }
    },
    [store, toast],
  );

  /**
   * Runs when the task form is saved. If it has a taskId we update that task,
   * otherwise we create a new one.
   */
  const handleSubmit = useCallback(
    (input: TaskInput, taskId?: string) => {
      if (taskId) {
        store.updateTask(taskId, input);
        setAnnouncement(`"${input.title}" saved.`);
        toast({ title: 'Task saved', description: input.title });
      } else {
        store.addTask(input);
        setAnnouncement(`"${input.title}" added.`);
        toast({ title: 'Task added', description: input.title });
      }
    },
    [store, toast],
  );

  /** Saves the event form: updates the event when it has an id, otherwise adds a new one. */
  const handleEventSubmit = useCallback(
    (input: EventInput, eventId?: string) => {
      if (eventId) {
        store.updateEvent(eventId, input);
        setAnnouncement(`"${input.name}" saved.`);
        toast({ title: 'Event updated', description: input.name });
      } else {
        store.addEvent(input);
        setAnnouncement(`"${input.name}" added.`);
        toast({ title: 'Event added', description: input.name });
      }
    },
    [store, toast],
  );

  /** Deletes an event and announces it for screen readers. */
  const handleEventDelete = useCallback(
    (id: string) => {
      const event = store.events.find((e) => e.id === id);
      store.deleteEvent(id);
      if (event) {
        setAnnouncement(`"${event.name}" deleted.`);
        toast({ title: 'Event deleted', description: event.name });
      }
    },
    [store, toast],
  );

  /** Opens the pop-up to add an event on the given date. */
  const openAddEvent = useCallback((date: ISODate) => setEventForm({ mode: 'create', defaultDate: date }), []);
  /** Opens the pop-up to edit an existing event. */
  const openEditEvent = useCallback((event: ChamberEvent) => setEventForm({ mode: 'edit', event }), []);

  /** Opens the pop-up to create a task. The due date starts as the given date. */
  const openCreate = useCallback((date: ISODate) => setFormState({ mode: 'create', defaultDate: date }), []);
  /** Opens the pop-up to edit an existing task. */
  const openEdit = useCallback((task: Task) => setFormState({ mode: 'edit', task }), []);

  const filtersActive = hasActiveFilters(filters);

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between gap-3 pb-4">
        <div>
          <h1 className="text-xl font-bold leading-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Events, sponsor deliverables and reminders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openAddEvent(selectedDate)}>
            <Plus />
            <span>
              <span className="sm:hidden">Event</span>
              <span className="hidden sm:inline">Add event</span>
            </span>
          </Button>
          <Button onClick={() => openCreate(selectedDate)}>
            <Plus />
            <span>
              <span className="sm:hidden">Task</span>
              <span className="hidden sm:inline">Add task</span>
            </span>
          </Button>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="grid content-start gap-4">
          <FilterBar filters={filters} pillars={store.pillars} sponsors={store.sponsors} onChange={setFilters} />
          {filtersActive && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Showing {visibleEvents.length} of {store.events.length} events and {visibleTasks.length} of{' '}
              {store.tasks.length} tasks.
            </p>
          )}
          <MonthHeader
            month={viewMonth}
            isCurrentMonth={isSameMonth(viewMonth, fromISODate(today)) && selectedDate === today}
            onPrevious={() => setViewMonth((m) => addMonths(m, -1))}
            onNext={() => setViewMonth((m) => addMonths(m, 1))}
            onToday={goToToday}
            onJump={setViewMonth}
          />
          {monthEventCount === 0 && (
            <p className="rounded-md border border-dashed px-4 py-3 text-center text-sm text-muted-foreground">
              {filtersActive ? 'No events match the filters this month.' : 'No events this month.'}{' '}
              <button
                type="button"
                onClick={() => openAddEvent(isSameMonth(fromISODate(selectedDate), viewMonth) ? selectedDate : toISODate(viewMonth))}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Add an event
              </button>
            </p>
          )}
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
        </div>

        <aside className="grid content-start gap-8 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-1">
          <DayPanel
            date={selectedDate}
            today={today}
            events={dayEvents}
            tasks={dayTasks}
            lookups={lookups}
            onAddTask={openCreate}
            onAddEvent={openAddEvent}
            onEditEvent={openEditEvent}
            onDeleteEvent={handleEventDelete}
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
          <UpcomingPanel
            today={today}
            tasks={upcoming}
            lookups={lookups}
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
            onShowDate={selectDate}
          />
        </aside>
      </main>

      <TaskFormDialog
        state={formState}
        events={store.events}
        sponsors={store.sponsors}
        staff={[store.currentUser, ...store.staff.filter((p) => p.id !== store.currentUser.id)]}
        onClose={() => setFormState(null)}
        onSubmit={handleSubmit}
      />

      <EventFormDialog state={eventForm} onClose={() => setEventForm(null)} onSubmit={handleEventSubmit} />

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
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
        Other event (colour = category)
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
