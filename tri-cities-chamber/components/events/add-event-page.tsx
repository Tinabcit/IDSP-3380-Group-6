"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { useToast } from "@/components/app-shell/toast-provider";
import { LowerExtras, MiniCalendar, PictureAndDescription, Section } from "@/components/events/event-sections";
import { UploadCard } from "@/components/events/upload-card";
import ReviewTasksDialog from "@/components/review-tasks-dialog/review-tasks-dialog";
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
import {
  EVENT_CATEGORIES,
  cleanSponsors,
  extrasFromEvent,
  extrasToInput,
  validateEventInput,
  validateEventForm,
  type EventExtras,
  type EventFormValues,
} from "@/lib/planner/events";
import { shiftISODate } from "@/lib/planner/dates";
import { suggestTasks, toTaskInput, type ProposedTask } from "@/lib/planner/proposed-tasks";
import type { EventCategory, ISODate } from "@/lib/planner/types";
import { extractFromFileName } from "@/lib/planner/upload";

const EMPTY: EventFormValues = {
  title: "",
  sponsors: [""],
  date: "",
  isSignature: false,
  category: "",
  address: "",
};

/**
 * The Add Event page (/events/new). A PDF upload card on top, then the event
 * fields. Title, sponsor, date and address are required; empty ones turn red and
 * say "Field Required". Sponsors can be added without limit. The category only
 * shows for a signature event.
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
  const [extras, setExtras] = useState<EventExtras>(() => extrasFromEvent(undefined));
  const [fileName, setFileName] = useState<string | undefined>();
  const [proposed, setProposed] = useState<ProposedTask[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [kept, setKept] = useState<ProposedTask[]>([]);
  // The upload card calls handleComplete from a timer, so it reads the latest form values through this ref.
  const latest = useRef({ values, today: data.today });
  useEffect(() => {
    latest.current = { values, today: data.today };
  });

  /** Updates one text field and clears its error. */
  function set(key: "title" | "date" | "category" | "address", value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  /** Updates the extra fields (picture, deadline, priority, labels and so on). */
  function setExtra(patch: Partial<EventExtras>) {
    setExtras((x) => ({ ...x, ...patch }));
  }

  /** Changes the name in one sponsor box. */
  function setSponsor(index: number, value: string) {
    setValues((v) => ({ ...v, sponsors: v.sponsors.map((s, i) => (i === index ? value : s)) }));
    setErrors((e) => ({ ...e, sponsors: undefined }));
  }

  /** Adds one more empty sponsor box. */
  function addSponsor() {
    setValues((v) => ({ ...v, sponsors: [...v.sponsors, ""] }));
  }

  /** Removes a sponsor box (the first one stays so there is always somewhere to type). */
  function removeSponsor(index: number) {
    setValues((v) => ({ ...v, sponsors: v.sponsors.filter((_, i) => i !== index) }));
  }

  /** Turns signature on or off; turning it off forgets the category. */
  function setSignature(on: boolean) {
    setValues((v) => ({ ...v, isSignature: on, category: on ? v.category : "" }));
    setErrors((e) => ({ ...e, category: undefined }));
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
        sponsorName: cleanSponsors(v.sponsors)[0] ?? "",
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
    const sponsorNames = cleanSponsors(values.sponsors);
    const input = {
      ...extrasToInput(extras),
      name: values.title.trim(),
      startDate: date,
      endDate: date,
      pillarId: data.pillars[0]?.id ?? "",
      isSignature: values.isSignature,
      category: values.isSignature ? (values.category as EventCategory) : "other",
      sponsorName: sponsorNames.join(", "),
      sponsorNames,
      address: values.address.trim(),
      location: values.address.trim(),
      fileName,
    };
    const problem = validateEventInput(input);
    if (problem) {
      setErrors({ date: problem });
      return;
    }
    const eventId = data.addEvent(input);
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
  function field(key: "title" | "date" | "address", label: string, placeholder: string, type = "text") {
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
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)] gap-5">
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
      <PictureAndDescription extras={extras} onChange={setExtra} />
      <Section title="Sponsors and signature">
      <div className="grid gap-1.5">
        <Label htmlFor="ev-sponsor-0">Event Sponsors</Label>
        {values.sponsors.map((name, index) => (
          <div key={index} className="flex gap-2">
            <Input
              id={`ev-sponsor-${index}`}
              value={name}
              onChange={(e) => setSponsor(index, e.target.value)}
              placeholder="Enter the Event Sponsor"
              aria-invalid={errors.sponsors ? true : undefined}
              aria-describedby={errors.sponsors ? "ev-sponsors-err" : undefined}
              list="ev-sponsors"
              className={errors.sponsors ? "text-destructive" : undefined}
            />
            {index > 0 && (
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
        {errors.sponsors && (
          <p id="ev-sponsors-err" role="alert" className="text-sm text-destructive">
            {errors.sponsors}
          </p>
        )}
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addSponsor}>
          <Plus />
          Add sponsor
        </Button>
      </div>
      <datalist id="ev-sponsors">
        {data.sponsors.map((s) => (
          <option key={s.id} value={s.name} />
        ))}
      </datalist>
      <div className="flex items-center gap-2">
        <Checkbox
          id="ev-signature"
          checked={values.isSignature}
          onCheckedChange={(on) => setSignature(on === true)}
        />
        <Label htmlFor="ev-signature">Signature event</Label>
      </div>
      {values.isSignature && (
        <div className="grid gap-1.5">
          <Label htmlFor="ev-category">Category</Label>
          <Select value={values.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger
              id="ev-category"
              aria-invalid={errors.category ? true : undefined}
              className={errors.category ? "border-destructive text-destructive" : undefined}
            >
              <SelectValue placeholder="Select a Category" />
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
      )}
      </Section>
      <MiniCalendar
        label="Date of Event"
        value={values.date}
        onChange={(d) => set("date", d)}
        error={errors.date}
      />
      <MiniCalendar label="Deadline" value={extras.deadline} onChange={(deadline) => setExtra({ deadline })} />
      <LowerExtras extras={extras} onChange={setExtra} />
      <Section title="Location">{field("address", "Address", "123 Main st")}</Section>
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
