"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { useToast } from "@/components/app-shell/toast-provider";
import { UploadCard } from "@/components/events/upload-card";
import ReviewTasksDialog from "@/components/review-tasks-dialog/review-tasks-dialog";
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
import { shiftISODate } from "@/lib/planner/dates";
import { suggestTasks, toTaskInput, type ProposedTask } from "@/lib/planner/proposed-tasks";
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
 * When an upload finishes, the Review tasks dialog opens with tasks read from
 * the document; the ones the user saves are created along with the event.
 * On success it saves the event and goes back to /events.
 */
export function AddEventPage() {
  const data = usePlannerData();
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<EventFormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormValues, string>>>({});
  const [fileName, setFileName] = useState<string | undefined>();
  const [proposed, setProposed] = useState<ProposedTask[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [kept, setKept] = useState<ProposedTask[]>([]);
  // The upload card calls handleComplete from a timer, so it reads the latest form values through this ref.
  const latest = useRef({ values, today: data.today });
  useEffect(() => {
    latest.current = { values, today: data.today };
  });

  /** Updates one field and clears its error. */
  function set(key: keyof EventFormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  /**
   * When an upload finishes, remember the file, fill in an empty title from its
   * name, and open the Review tasks dialog with the tasks read from the document.
   * Due dates count back from the event date (30 days from today if none is set yet).
   */
  const handleComplete = useCallback((name: string) => {
    const { values: v, today } = latest.current;
    const title = v.title.trim() || extractFromFileName(name).title;
    setFileName(name);
    setValues((cur) => (cur.title.trim() ? cur : { ...cur, title }));
    setErrors((e) => ({ ...e, title: undefined }));
    setProposed(
      suggestTasks({
        fileName: name,
        eventName: title,
        sponsorName: v.sponsor,
        eventDate: v.date || shiftISODate(today, 30),
      })
    );
    setKept([]);
    setReviewOpen(true);
  }, []);

  /** Closes the dialog and remembers the tasks the user saved until the event is submitted. */
  function handleReviewDone(saved: ProposedTask[]) {
    setKept(saved);
    setReviewOpen(false);
    if (saved.length > 0) {
      toast({
        title: `${saved.length} ${saved.length === 1 ? "task" : "tasks"} saved`,
        description: "They are added to the calendar when you submit the event.",
        kind: "success",
      });
    }
  }

  /** Throws away the file and every task read from it. */
  function handleClear() {
    setFileName(undefined);
    setProposed([]);
    setKept([]);
  }

  /** Checks every field, then saves the event or shows the errors. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateEventForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const date = values.date as ISODate;
    const eventId = data.addEvent({
      name: values.title.trim(),
      startDate: date,
      endDate: date,
      pillarId: data.pillars[0]?.id ?? "",
      isSignature: false,
      category: values.category as EventCategory,
      sponsorName: values.sponsor.trim(),
      // email: values.email.trim(),
      // phone: values.phone.trim(),
      address: values.address.trim(),
      location: values.address.trim(),
      fileName,
    });
    for (const task of kept) {
      const sponsor = data.sponsors.find((x) => x.name.toLowerCase() === task.sponsorName.toLowerCase());
      data.addTask(
        toTaskInput(task, { assigneeId: data.currentUser.id, eventId, sponsorId: sponsor?.id })
      );
    }
    toast({
      title: "Event added",
      description:
        kept.length > 0
          ? `${values.title.trim()} and ${kept.length} ${kept.length === 1 ? "task" : "tasks"}`
          : values.title.trim(),
      kind: "success",
    });
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
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-xl grid-cols-[minmax(0,1fr)] gap-5">
      <h1 className="text-xl font-bold">Add Event</h1>
      <UploadCard onComplete={handleComplete} onClear={handleClear} />
      {proposed.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm">
          <p role="status">
            {kept.length > 0
              ? `${kept.length} ${kept.length === 1 ? "task" : "tasks"} will be added with this event.`
              : "No tasks saved yet."}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
            Review tasks
          </Button>
        </div>
      )}
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
      {/* {field("email", "Email", "john@example.com", "email")}
      {field("phone", "Phone", "+1 (555) 123-4567", "tel")} */}
      {field("address", "Address", "123 Main st")}
      <div className="flex justify-center gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
      <ReviewTasksDialog
        open={reviewOpen}
        tasks={proposed}
        onDone={handleReviewDone}
        onClose={() => setReviewOpen(false)}
      />
    </form>
  );
}
