'use client';

import { useCallback, useMemo, useState } from 'react';
import { addMonths, isSameMonth, startOfMonth } from 'date-fns';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { usePlannerData } from '@/components/app-shell/planner-provider';
import { fromISODate, getMonthGrid, toISODate } from '@/lib/planner/dates';
import {
  eventsOnDate,
  filterEvents,
  filterTasks,
  hasActiveFilters,
  sortTasks,
  summarizeByDate,
  upcomingTasks,
} from '@/lib/planner/selectors';
import { EMPTY_FILTERS, type ISODate, type PlannerFilters, type Task, type TaskInput } from '@/lib/planner/types';

import { DayPanel } from './day-panel';
import { FilterBar } from './filter-bar';
import { MonthGrid } from './month-grid';
import { MonthHeader } from './month-header';
import { TaskFormDialog, type TaskFormState } from './task-form-dialog';
import { UpcomingPanel } from './upcoming-panel';

export function PlannerApp() {
  const store = usePlannerData();
  const { today, lookups } = store;

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(fromISODate(today)));
  const [selectedDate, setSelectedDate] = useState<ISODate>(today);
  const [focusKey, setFocusKey] = useState(0);
  const [filters, setFilters] = useState<PlannerFilters>(EMPTY_FILTERS);
  const [formState, setFormState] = useState<TaskFormState | null>(null);
  const [announcement, setAnnouncement] = useState('');

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
  const dayTasks = useMemo(
    () =>
      sortTasks(
        visibleTasks.filter((t) => t.dueDate === selectedDate),
        today,
      ),
    [visibleTasks, selectedDate, today],
  );
  const upcoming = useMemo(() => upcomingTasks(visibleTasks, today), [visibleTasks, today]);

  const selectDate = useCallback((date: ISODate) => {
    setSelectedDate(date);
    setViewMonth((current) => {
      const d = fromISODate(date);
      return isSameMonth(d, current) ? current : startOfMonth(d);
    });
  }, []);

  const navigateWithKeyboard = useCallback(
    (date: ISODate) => {
      selectDate(date);
      setFocusKey((k) => k + 1);
    },
    [selectDate],
  );

  const goToToday = useCallback(() => selectDate(today), [selectDate, today]);

  const handleToggle = useCallback(
    (id: string) => {
      const task = store.tasks.find((t) => t.id === id);
      store.toggleTask(id);
      if (task) {
        setAnnouncement(task.completed ? `"${task.title}" marked as not done.` : `"${task.title}" marked as done.`);
      }
    },
    [store],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const task = store.tasks.find((t) => t.id === id);
      store.deleteTask(id);
      if (task) setAnnouncement(`"${task.title}" deleted.`);
    },
    [store],
  );

  const handleSubmit = useCallback(
    (input: TaskInput, taskId?: string) => {
      if (taskId) {
        store.updateTask(taskId, input);
        setAnnouncement(`"${input.title}" saved.`);
      } else {
        store.addTask(input);
        setAnnouncement(`"${input.title}" added.`);
      }
    },
    [store],
  );

  const openCreate = useCallback((date: ISODate) => setFormState({ mode: 'create', defaultDate: date }), []);
  const openEdit = useCallback((task: Task) => setFormState({ mode: 'edit', task }), []);

  const filtersActive = hasActiveFilters(filters);

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between gap-3 pb-4">
        <div>
          <h1 className="text-xl font-bold leading-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Events, sponsor deliverables and reminders</p>
        </div>
        <Button onClick={() => openCreate(selectedDate)}>
          <Plus />
          <span>
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add task</span>
          </span>
        </Button>
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
        </div>

        <aside className="grid content-start gap-8 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-1">
          <DayPanel
            date={selectedDate}
            today={today}
            events={dayEvents}
            tasks={dayTasks}
            lookups={lookups}
            onAddTask={openCreate}
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

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

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
