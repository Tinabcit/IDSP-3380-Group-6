"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { useToast } from "@/components/app-shell/toast-provider";
import { UploadCard } from "@/components/events/upload-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EVENT_CATEGORIES,
  validateEventForm,
  type EventFormValues,
} from "@/lib/planner/events";
import type { EventCategory, ISODate } from "@/lib/planner/types";
import { extractFromFileName } from "@/lib/planner/upload";

const EMPTY: EventFormValues = {
  title: "",
  sponsor: "",
  date: "",
  category: "",
  email: "",
  phone: "",
  address: "",
};

/**
 * The Add Event page (/events/new). A PDF upload card on top, then the event
 * fields. Every field is required; empty ones turn red and say "Field Required".
 * On success it saves the event and goes back to /events.
 */
export function AddEventPage() {
  const data = usePlannerData();
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<EventFormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormValues, string>>>({});
  const [fileName, setFileName] = useState<string | undefined>();

  /** Updates one field and clears its error. */
  function set(key: keyof EventFormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  /** When an upload finishes, remember the file and fill in an empty title from its name. */
  const handleComplete = useCallback((name: string) => {
    setFileName(name);
    setValues((v) => (v.title.trim() ? v : { ...v, title: extractFromFileName(name).title }));
  }, []);

  /** Checks every field, then saves the event or shows the errors. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateEventForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const date = values.date as ISODate;
    data.addEvent({
      name: values.title.trim(),
      startDate: date,
      endDate: date,
      pillarId: data.pillars[0]?.id ?? "",
      isSignature: false,
      category: values.category as EventCategory,
      sponsorName: values.sponsor.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      location: values.address.trim(),
      fileName,
    });
    toast({ title: "Event added", description: values.title.trim(), kind: "success" });
    router.push("/events");
  }

  /** Renders one labelled text field with its error. */
  function field(key: keyof EventFormValues, label: string, placeholder: string, type = "text") {
    const error = errors[key];
    return (
      <div className="grid gap-1.5">
        <Label htmlFor={`ev-${key}`}>{label}</Label>
        <Input
          id={`ev-${key}`}
          type={type}
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `ev-${key}-err` : undefined}
          list={key === "sponsor" ? "ev-sponsors" : undefined}
          className={error ? "text-destructive" : undefined}
        />
        {error && (
          <p id={`ev-${key}-err`} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-xl gap-5">
      <h1 className="text-xl font-bold">Add Event</h1>
      <UploadCard
        onComplete={handleComplete}
        onClear={() => setFileName(undefined)}
      />
      {field("title", "Title", "Enter the Event Title")}
      {field("sponsor", "Event Sponsor", "Enter the Event Sponsor")}
      <datalist id="ev-sponsors">
        {data.sponsors.map((s) => (
          <option key={s.id} value={s.name} />
        ))}
      </datalist>
      {field("date", "Date", "Set Date", "date")}
      <div className="grid gap-1.5">
        <Label htmlFor="ev-category">Categories</Label>
        <Select value={values.category} onValueChange={(v) => set("category", v)}>
          <SelectTrigger
            id="ev-category"
            aria-invalid={errors.category ? true : undefined}
            className={errors.category ? "border-destructive text-destructive" : undefined}
          >
            <SelectValue placeholder="Select Categories" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p role="alert" className="text-sm text-destructive">
            {errors.category}
          </p>
        )}
      </div>
      {field("email", "Email", "john@example.com", "email")}
      {field("phone", "Phone", "+1 (555) 123-4567", "tel")}
      {field("address", "Address", "123 Main st")}
      <div className="flex justify-center gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
