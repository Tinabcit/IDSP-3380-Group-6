"use client";

import { useState } from "react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { EventFormFields } from "@/components/events/event-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  emptyEventForm,
  eventToForm,
  formToEventInput,
  validateEventForm,
  type EventFormErrors,
  type EventFormValues,
} from "@/lib/planner/events";
import type { ChamberEvent, EventInput, ISODate } from "@/lib/planner/types";

/** What the dialog is doing: adding a new event on a date, or editing an existing one. */
export type EventFormState =
  | { mode: "create"; defaultDate: ISODate }
  | { mode: "edit"; event: ChamberEvent };

/** The information EventFormDialog needs. */
interface EventFormDialogProps {
  /** null keeps the dialog closed. */
  state: EventFormState | null;
  onClose: () => void;
  /** Called with the checked values; eventId is set when editing. */
  onSubmit: (input: EventInput, eventId?: string) => void;
}

/**
 * The pop-up for adding or editing an event. The form inside is only created
 * while the pop-up is open, so it starts fresh each time. It uses the same
 * fields as the Add Event page.
 */
export function EventFormDialog({ state, onClose, onSubmit }: EventFormDialogProps) {
  return (
    <Dialog open={state !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {state && <EventForm key={state.mode === "edit" ? state.event.id : "new"} state={state} onClose={onClose} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
}

/** The form inside the pop-up: checks the fields on Save, then passes them up and closes. */
function EventForm({
  state,
  onClose,
  onSubmit,
}: {
  state: EventFormState;
  onClose: () => void;
  onSubmit: EventFormDialogProps["onSubmit"];
}) {
  const data = usePlannerData();
  const editing = state.mode === "edit" ? state.event : undefined;
  const [values, setValues] = useState<EventFormValues>(() =>
    editing ? eventToForm(editing) : emptyEventForm(state.mode === "create" ? state.defaultDate : data.today)
  );
  const [errors, setErrors] = useState<EventFormErrors>({});

  /** Changes some fields and clears their error messages. */
  function change(patch: Partial<EventFormValues>) {
    setValues((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key as keyof EventFormErrors];
      return next;
    });
  }

  /** Runs on Save. Shows the errors, or saves the event and closes the pop-up. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateEventForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(formToEventInput(values, editing, data.pillars[0]?.id ?? ""), editing?.id);
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit event" : "Add event"}</DialogTitle>
        <DialogDescription>Only the event name and date are required.</DialogDescription>
      </DialogHeader>
      <EventFormFields
        values={values}
        errors={errors}
        onChange={change}
        sponsorSuggestions={data.sponsors.map((s) => s.name)}
        autoFocus
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save event</Button>
      </DialogFooter>
    </form>
  );
}
