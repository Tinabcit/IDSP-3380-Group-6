"use client";

import { useState } from "react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { EVENT_CATEGORIES, categoryOf, validateEventInput } from "@/lib/planner/events";
import type { ChamberEvent, EventCategory, EventInput, ISODate } from "@/lib/planner/types";

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
 * while the pop-up is open, so it starts fresh each time. It checks the values
 * with validateEventInput and hands them to the parent, which saves them.
 */
export function EventFormDialog({ state, onClose, onSubmit }: EventFormDialogProps) {
  return (
    <Dialog open={state !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {state && <EventForm key={state.mode === "edit" ? state.event.id : "new"} state={state} onClose={onClose} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
}

/** The form fields: name, dates, times, pillar, category, location, description, signature. */
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
  const editing = state.mode === "edit" ? state.event : null;
  const [name, setName] = useState(editing?.name ?? "");
  const [date, setDate] = useState(editing?.startDate ?? (state.mode === "create" ? state.defaultDate : data.today));
  const [endDate, setEndDate] = useState(editing && editing.endDate !== editing.startDate ? editing.endDate : "");
  const [startTime, setStartTime] = useState(editing?.startTime ?? "");
  const [endTime, setEndTime] = useState(editing?.endTime ?? "");
  const [pillarId, setPillarId] = useState(editing?.pillarId ?? data.pillars[0].id);
  const [category, setCategory] = useState<EventCategory>(editing ? categoryOf(editing) : "other");
  const [isSignature, setIsSignature] = useState(editing?.isSignature ?? false);
  const [location, setLocation] = useState(editing?.location ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [error, setError] = useState("");

  /** Runs on Save. Checks the values, then passes them up and closes the pop-up. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: EventInput = {
      name: name.trim(),
      startDate: date,
      endDate: endDate || date,
      startTime: startTime || undefined,
      // An end time means nothing without a start time.
      endTime: startTime && endTime ? endTime : undefined,
      pillarId,
      category,
      isSignature,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    };
    const problem = validateEventInput(input);
    if (problem) return setError(problem);
    onSubmit(input, editing?.id);
    onClose();
  }

  /** Clears the error message when the person starts fixing the form. */
  function clearError() {
    setError("");
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit event" : "New event"}</DialogTitle>
        <DialogDescription>
          Events can repeat or be one-offs. Add each occurrence on its own.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="ev-name">Name</Label>
        <Input
          id="ev-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError();
          }}
          autoComplete="off"
          autoFocus
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="ev-date">Date</Label>
          <Input id="ev-date" type="date" value={date} onChange={(e) => { setDate(e.target.value); clearError(); }} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ev-end">
            Last day <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="ev-end" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); clearError(); }} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="ev-start-time">
            Start time <span className="font-normal text-muted-foreground">(blank = all day)</span>
          </Label>
          <Input id="ev-start-time" type="time" value={startTime} onChange={(e) => { setStartTime(e.target.value); clearError(); }} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ev-end-time">
            End time <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="ev-end-time"
            type="time"
            value={endTime}
            disabled={!startTime}
            onChange={(e) => { setEndTime(e.target.value); clearError(); }}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="ev-pillar">Pillar</Label>
          <Select value={pillarId} onValueChange={setPillarId}>
            <SelectTrigger id="ev-pillar">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.pillars.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ev-category">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)}>
            <SelectTrigger id="ev-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ev-loc">
          Location <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input id="ev-loc" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ev-desc">
          Description <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="ev-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="ev-sig"
          checked={isSignature}
          onCheckedChange={(v) => setIsSignature(v === true)}
        />
        <Label htmlFor="ev-sig">Signature event</Label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{editing ? "Save event" : "Add event"}</Button>
      </DialogFooter>
    </form>
  );
}
