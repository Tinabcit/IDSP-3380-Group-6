import { fromISODate } from "@/lib/planner/dates";
import type { TasksOnDay } from "@/lib/planner/dashboard";
import "./duedates.css";

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
    <li className='due-dates__day'>
      <span className='due-dates__weekday'>
        {date.toLocaleDateString("en-US", { weekday: "short" })}
      </span>
      <span className='due-dates__date'>{date.getDate()}</span>
      <span className='due-dates__count'>&bull; {taskLabel(day.count)}</span>
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
    <section className='due-dates'>
      <header className='due-dates__header'>
        <h2 className='due-dates__title'>Due dates at a glance</h2>
        <p className='due-dates__subtitle'>
          {monthLabel} &middot; Tasks per day
        </p>
      </header>
      <ul className='due-dates__list'>
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
