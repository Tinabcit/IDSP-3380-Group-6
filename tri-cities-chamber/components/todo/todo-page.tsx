'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { usePlannerData } from '@/components/app-shell/planner-provider';
import { TaskFormDialog, type TaskFormState } from '@/components/planner/task-form-dialog';
import { TaskItem } from '@/components/planner/task-item';
import { Button } from '@/components/ui/button';
import { sortTasks } from '@/lib/planner/selectors';
import type { Task, TaskInput } from '@/lib/planner/types';

/**
 * The to-do page ("/todo") - the task list ONLY. No calendar here.
 * Lists every task (overdue first, then pending, then done) with the
 * tick, edit and delete actions and an "Add task" button.
 */
export function TodoPage() {
  const store = usePlannerData();
  const { today, lookups } = store;

  const [formState, setFormState] = useState<TaskFormState | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const tasks = useMemo(() => sortTasks(store.tasks, today), [store.tasks, today]);
  const doneCount = tasks.filter((t) => t.completed).length;

  /** Ticks or unticks a task and announces it for screen readers. */
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

  /** Deletes a task and announces it for screen readers. */
  const handleDelete = useCallback(
    (id: string) => {
      const task = store.tasks.find((t) => t.id === id);
      store.deleteTask(id);
      if (task) setAnnouncement(`"${task.title}" deleted.`);
    },
    [store],
  );

  /** Runs when the form is saved: updates the task if it has an id, otherwise creates one. */
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

  const openEdit = useCallback((task: Task) => setFormState({ mode: 'edit', task }), []);

  return (
    <div className="grid gap-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">To-do</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.length - doneCount} open, {doneCount} done
          </p>
        </div>
        <Button onClick={() => setFormState({ mode: 'create', defaultDate: today })}>
          <Plus />
          Add task
        </Button>
      </header>

      {tasks.length > 0 ? (
        <ul aria-label="Tasks" className="grid gap-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              today={today}
              lookups={lookups}
              showDueDate
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No tasks yet.
        </p>
      )}

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
