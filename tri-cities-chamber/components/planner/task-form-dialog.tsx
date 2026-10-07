"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatShortDate } from "@/lib/planner/dates";
import type {
  ChamberEvent,
  ISODate,
  Sponsor,
  StaffMember,
  Task,
  TaskInput,
} from "@/lib/planner/types";

const NONE = "none";

export type TaskFormState =
  | { mode: "create"; defaultDate: ISODate }
  | { mode: "edit"; task: Task };

interface TaskFormDialogProps {
  state: TaskFormState | null;
  events: ChamberEvent[];
  sponsors: Sponsor[];
  staff: StaffMember[];
  onClose: () => void;
  onSubmit: (input: TaskInput, taskId?: string) => void;
}

export function TaskFormDialog({
  state,
  onClose,
  ...rest
}: TaskFormDialogProps) {
  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {state && (
          // Keyed so the form resets each time it opens for a different task.
          <TaskForm
            key={state.mode === "edit" ? state.task.id : `new-${state.defaultDate}`}
            state={state}
            onClose={onClose}
            {...rest}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TaskFormProps extends Omit<TaskFormDialogProps, "state"> {
  state: TaskFormState;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
}

function TaskForm({
  state,
  events,
  sponsors,
  staff,
  onClose,
  onSubmit,
}: TaskFormProps) {
  const initial: TaskInput =
    state.mode === "edit"
      ? {
          title: state.task.title,
          dueDate: state.task.dueDate,
          assigneeId: state.task.assigneeId,
          eventId: state.task.eventId,
          sponsorId: state.task.sponsorId,
          notes: state.task.notes,
        }
      : {
          title: "",
          dueDate: state.defaultDate,
          assigneeId: staff[0]?.id ?? "",
        };

  const [values, setValues] = useState<TaskInput>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  const sortedEvents = [...events].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  function update<K extends keyof TaskInput>(key: K, value: TaskInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = values.title.trim();
    const next: FormErrors = {};
    if (!title) next.title = "Enter a task name.";
    if (!values.dueDate) next.dueDate = "Choose a due date.";
    if (next.title || next.dueDate) {
      setErrors(next);
      return;
    }
    onSubmit(
      {
        ...values,
        title,
        notes: values.notes?.trim() || undefined,
      },
      state.mode === "edit" ? state.task.id : undefined
    );
    onClose();
  }

  const isEdit = state.mode === "edit";

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        <DialogDescription>
          Link it to an event or sponsor so the team can find it later.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="task-title">Task</Label>
        <Input
          id="task-title"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Send logo files to printer"
          autoComplete="off"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "task-title-error" : undefined}
          autoFocus
        />
        {errors.title && (
          <p id="task-title-error" className="text-sm text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="task-due">Due date</Label>
          <Input
            id="task-due"
            type="date"
            value={values.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby={errors.dueDate ? "task-due-error" : undefined}
          />
          {errors.dueDate && (
            <p id="task-due-error" className="text-sm text-destructive">
              {errors.dueDate}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="task-assignee">Assigned to</Label>
          <Select
            value={values.assigneeId}
            onValueChange={(v) => update("assigneeId", v)}
          >
            <SelectTrigger id="task-assignee">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {staff.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="task-event">Event</Label>
        <Select
          value={values.eventId ?? NONE}
          onValueChange={(v) => update("eventId", v === NONE ? undefined : v)}
        >
          <SelectTrigger id="task-event">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>No event</SelectItem>
            {sortedEvents.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name} ({formatShortDate(event.startDate)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="task-sponsor">Sponsor</Label>
        <Select
          value={values.sponsorId ?? NONE}
          onValueChange={(v) =>
            update("sponsorId", v === NONE ? undefined : v)
          }
        >
          <SelectTrigger id="task-sponsor">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>No sponsor</SelectItem>
            {sponsors.map((sponsor) => (
              <SelectItem key={sponsor.id} value={sponsor.id}>
                {sponsor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="task-notes">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="task-notes"
          value={values.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Contract details, contacts, file locations"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? "Save changes" : "Add task"}</Button>
      </DialogFooter>
    </form>
  );
}
