"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { useToast } from "@/components/app-shell/toast-provider";
import { EventFormFields } from "@/components/events/event-form-fields";
import { UploadCard } from "@/components/events/upload-card";
import ReviewTasksDialog from "@/components/review-tasks-dialog/review-tasks-dialog";
import { Button } from "@/components/ui/button";
import {
  cleanSponsors,
  emptyEventForm,
  formToEventInput,
  validateEventForm,
  type EventFormErrors,
  type EventFormValues,
} from "@/lib/planner/events";
import { shiftISODate } from "@/lib/planner/dates";
import { suggestTasks, toTaskInput, type ProposedTask } from "@/lib/planner/proposed-tasks";
import { extractFromFileName } from "@/lib/planner/upload";

/**
 * The Add Event page (/events/new). An optional PDF upload on top, then the same
 * event fields as the calendar pop-up. Only the name and date are required.
 * When an upload finishes, the Review tasks dialog opens with tasks read from
 * the document; the ones the user saves are created along with the event.
 * On success it saves the event and opens its page.
 */
export function AddEventPage() {
  const data = usePlannerData();
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<EventFormValues>(() => emptyEventForm(""));
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [fileName, setFileName] = useState<string | undefined>();
  const [proposed, setProposed] = useState<ProposedTask[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [kept, setKept] = useState<ProposedTask[]>([]);
  // The upload card calls handleComplete from a timer, so it reads the latest form values through this ref.
  const latest = useRef({ values, today: data.today });
  useEffect(() => {
    latest.current = { values, today: data.today };
  });

  /** Changes some fields and clears their error messages. */
  function change(patch: Partial<EventFormValues>) {
    setValues((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key as keyof EventFormErrors];
      return next;
    });
  }

  /**
   * When an upload finishes, remember the file, fill in an empty name from its
   * file name, and open the Review tasks dialog with the tasks read from the document.
   * Due dates count back from the event date (30 days from today if none is set yet).
   */
  const handleComplete = useCallback((name: string) => {
    const { values: v, today } = latest.current;
    const eventName = v.name.trim() || extractFromFileName(name).title;
    setFileName(name);
    setValues((cur) => (cur.name.trim() ? cur : { ...cur, name: eventName }));
    setErrors((e) => ({ ...e, name: undefined }));
    setProposed(
      suggestTasks({
        fileName: name,
        eventName,
        sponsorName: cleanSponsors(v.sponsors)[0] ?? "",
        eventDate: v.startDate || shiftISODate(today, 30),
      })
    );
    setKept([]);
    setReviewOpen(true);
  }, []);

  /** Closes the dialog and remembers the tasks the user saved until the event is saved. */
  function handleReviewDone(saved: ProposedTask[]) {
    setKept(saved);
    setReviewOpen(false);
    if (saved.length > 0) {
      toast({
        title: `${saved.length} ${saved.length === 1 ? "task" : "tasks"} saved`,
        description: "They are added to the calendar when you save the event.",
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

  /** Checks the fields, then saves the event (and any kept tasks) or shows the errors. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateEventForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const input = { ...formToEventInput(values, undefined, data.pillars[0]?.id ?? ""), fileName };
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
          ? `${input.name} and ${kept.length} ${kept.length === 1 ? "task" : "tasks"}`
          : input.name,
      kind: "success",
    });
    router.push(`/events/${eventId}`);
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)] gap-5">
      <div>
        <h1 className="text-xl font-bold">Add event</h1>
        <p className="text-sm text-muted-foreground">
          Only the event name and date are required. You can fill in the rest later.
        </p>
      </div>
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
      <EventFormFields
        values={values}
        errors={errors}
        onChange={change}
        sponsorSuggestions={data.sponsors.map((s) => s.name)}
      />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit">Save event</Button>
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
