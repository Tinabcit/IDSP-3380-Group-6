"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  EVENT_CATEGORIES,
  type EventFormErrors,
  type EventFormValues,
} from "@/lib/planner/events";
import type { EventCategory } from "@/lib/planner/types";

/** The information EventFormFields needs. */
interface EventFormFieldsProps {
  values: EventFormValues;
  errors: EventFormErrors;
  /** Changes some fields; the parent keeps the values. */
  onChange: (patch: Partial<EventFormValues>) => void;
  /** Sponsor names to suggest while typing. */
  sponsorSuggestions: string[];
  /** Put the cursor in the name box when the form opens. */
  autoFocus?: boolean;
}

/**
 * The event form fields, shared by the Add Event page and the calendar pop-up so
 * both ask for exactly the same things. Three groups, in the order people think
 * about an event: what and when, who is sponsoring, then optional extras.
 * Only the name and date are required.
 */
export function EventFormFields({
  values,
  errors,
  onChange,
  sponsorSuggestions,
  autoFocus,
}: EventFormFieldsProps) {
  /** Changes the name in one sponsor box. */
  function setSponsor(index: number, name: string) {
    onChange({ sponsors: values.sponsors.map((s, i) => (i === index ? name : s)) });
  }

  /** Removes one sponsor box, keeping at least one so there is somewhere to type. */
  function removeSponsor(index: number) {
    const next = values.sponsors.filter((_, i) => i !== index);
    onChange({ sponsors: next.length > 0 ? next : [""] });
  }

  return (
    <div className="grid gap-5">
      <FieldGroup title="About the event">
        <Field id="ev-name" label="Event name" error={errors.name}>
          <Input
            id="ev-name"
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Spring Business Gala"
            autoComplete="off"
            autoFocus={autoFocus}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "ev-name-err" : undefined}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ev-date" label="Date" error={errors.startDate}>
            <Input
              id="ev-date"
              type="date"
              value={values.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              aria-invalid={errors.startDate ? true : undefined}
              aria-describedby={errors.startDate ? "ev-date-err" : undefined}
            />
          </Field>
          <Field id="ev-end" label="Last day" optional hint="Only for events longer than one day." error={errors.endDate}>
            <Input
              id="ev-end"
              type="date"
              value={values.endDate}
              min={values.startDate || undefined}
              onChange={(e) => onChange({ endDate: e.target.value })}
              aria-invalid={errors.endDate ? true : undefined}
              aria-describedby={errors.endDate ? "ev-end-err" : "ev-end-hint"}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ev-start-time" label="Start time" optional hint="Leave blank for an all-day event.">
            <Input
              id="ev-start-time"
              type="time"
              value={values.startTime}
              onChange={(e) => onChange({ startTime: e.target.value })}
              aria-describedby="ev-start-time-hint"
            />
          </Field>
          <Field id="ev-end-time" label="End time" optional error={errors.endTime}>
            <Input
              id="ev-end-time"
              type="time"
              value={values.endTime}
              disabled={!values.startTime}
              onChange={(e) => onChange({ endTime: e.target.value })}
              aria-invalid={errors.endTime ? true : undefined}
              aria-describedby={errors.endTime ? "ev-end-time-err" : undefined}
            />
          </Field>
        </div>

        <Field id="ev-location" label="Location" optional>
          <Input
            id="ev-location"
            value={values.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g. Civic Centre, 123 Main St"
          />
        </Field>
      </FieldGroup>

      <FieldGroup
        title="Sponsors"
        description="Who is sponsoring this event. Money and payments come from each sponsor's contract."
      >
        <div className="grid gap-2">
          {values.sponsors.map((name, index) => (
            <div key={index} className="flex gap-2">
              <Input
                aria-label={`Sponsor ${index + 1}`}
                value={name}
                onChange={(e) => setSponsor(index, e.target.value)}
                placeholder="Sponsor name"
                list="ev-sponsor-suggestions"
                autoComplete="off"
              />
              {(values.sponsors.length > 1 || name) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove sponsor ${index + 1}`}
                  onClick={() => removeSponsor(index)}
                >
                  <X />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => onChange({ sponsors: [...values.sponsors, ""] })}
          >
            <Plus />
            Add another sponsor
          </Button>
          <datalist id="ev-sponsor-suggestions">
            {sponsorSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </FieldGroup>

      <FieldGroup title="More details" description="All optional.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ev-category" label="Type of event">
            <Select
              value={values.category}
              onValueChange={(v) => onChange({ category: v as EventCategory })}
              items={EVENT_CATEGORIES}
            >
              <SelectTrigger id="ev-category" className="w-full">
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
          </Field>
          <Field id="ev-attendees" label="Expected attendees" error={errors.attendees}>
            <Input
              id="ev-attendees"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={values.attendees}
              onChange={(e) => onChange({ attendees: e.target.value })}
              placeholder="e.g. 50"
              aria-invalid={errors.attendees ? true : undefined}
              aria-describedby={errors.attendees ? "ev-attendees-err" : undefined}
            />
          </Field>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="ev-signature"
            checked={values.isSignature}
            onCheckedChange={(on) => onChange({ isSignature: on === true })}
            aria-describedby="ev-signature-hint"
            className="mt-0.5"
          />
          <div className="grid gap-0.5">
            <Label htmlFor="ev-signature">Signature event</Label>
            <p id="ev-signature-hint" className="text-sm text-muted-foreground">
              One of the Chamber&apos;s main events of the year. It is highlighted on the calendar.
            </p>
          </div>
        </div>

        <Field id="ev-description" label="Description">
          <Textarea
            id="ev-description"
            rows={3}
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="What the event is about"
          />
        </Field>
      </FieldGroup>
    </div>
  );
}

/** A titled box that holds one group of fields. */
function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid min-w-0 gap-4 rounded-lg border bg-card p-4">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      {description && <p className="-mt-2 text-sm text-muted-foreground">{description}</p>}
      {children}
    </fieldset>
  );
}

/** One labelled field with an optional hint and error under it. */
function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
