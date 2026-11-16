import { fromISODate } from "@/lib/planner/dates";
import type { TasksOnDay } from "@/lib/planner/dashboard";

interface DueDatesProps {
  days: TasksOnDay[];
}

/** Turns a task count into the small label under a day ("No tasks", "1 task", "3 tasks"). */
function taskLabel(count: number): string {
  if (count === 0) return "No tasks";
  return `${count} ${count === 1 ? "task" : "tasks"}`;
}
function DayColumn({ day }: { day: TasksOnDay }) {
  const date = fromISODate(day.date);
  return (
    <li className='flex min-w-20 flex-1 flex-col items-center gap-1 text-center'>
      <span className='text-xs text-muted-foreground'>
        {date.toLocaleDateString("en-US", { weekday: "short" })}
      </span>
      <span className='text-2xl font-semibold leading-none'>
        {date.getDate()}
      </span>
      <span className='text-xs'>&bull; {taskLabel(day.count)}</span>
    </li>
  );
}

export function DueDates({ days }: DueDatesProps) {
  const monthLabel = days.length
    ? fromISODate(days[0].date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <section className='flex w-full flex-col gap-6 rounded-lg border bg-card p-4 text-card-foreground'>
      <header className='flex items-baseline justify-between gap-4'>
        <h2 className='text-sm font-semibold'>Due dates at a glance</h2>
        <p className='text-xs text-muted-foreground'>
          {monthLabel} &middot; Tasks per day
        </p>
      </header>
      <ul className='flex w-full overflow-x-auto pb-1'>
        {days.map((day) => (
          <DayColumn
            key={day.date}
            day={day}
          />
        ))}
      </ul>
    </section>
  );
}
