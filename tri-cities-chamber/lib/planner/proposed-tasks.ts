import { shiftISODate } from "./dates";
import type { ISODate, TaskInput } from "./types";

/** One task the document reader suggests. The user keeps, edits or dismisses it in the Review tasks dialog. */
export interface ProposedTask {
  id: string;
  title: string;
  description: string;
  eventName: string;
  sponsorName: string;
  dueDate: ISODate;
}

/** What we know about the upload when suggesting tasks. */
export interface SuggestInput {
  fileName: string;
  eventName: string;
  sponsorName: string;
  eventDate: ISODate;
}

/** The standard checklist: a title, how many days before the event it is due, and a sentence of detail. */
const TEMPLATES: { title: string; daysBefore: number; describe: (who: string, event: string) => string }[] = [
  {
    title: "Confirm sponsorship agreement",
    daysBefore: 30,
    describe: (who, event) => `Check the signed agreement ${who}for ${event} and file a copy.`,
  },
  {
    title: "Request logo and promo assets",
    daysBefore: 21,
    describe: (who, event) => `Ask ${who ? who.trim() : "the sponsor"} for logo files and promo copy to use for ${event}.`,
  },
  {
    title: "Allocate complimentary tickets",
    daysBefore: 14,
    describe: (who, event) =>
      `Allocate the complimentary tickets ${who}for ${event}. Confirm guest names, then send the registration details.`,
  },
  {
    title: "Send event details to sponsor",
    daysBefore: 7,
    describe: (who, event) => `Send the schedule, venue and parking details for ${event} ${who ? `to ${who.trim()}` : "to the sponsor"}.`,
  },
  {
    title: "Send sponsor thank-you and follow-up",
    daysBefore: 0,
    describe: (who, event) => `Thank ${who ? who.trim() : "the sponsor"} and ask for feedback after ${event}.`,
  },
];

/**
 * Pretend document reading: suggests the usual sponsor tasks for an event, with
 * due dates counted back from the event date (earliest first). The same file
 * always gives the same suggestions. A real reader would replace this.
 */
export function suggestTasks(input: SuggestInput): ProposedTask[] {
  const who = input.sponsorName.trim() ? `with ${input.sponsorName.trim()} ` : "";
  const event = input.eventName.trim() || "the event";
  return TEMPLATES.map((t, i) => ({
    id: `proposed-${i}`,
    title: t.title,
    description: t.describe(who, event),
    eventName: event,
    sponsorName: input.sponsorName.trim(),
    dueDate: shiftISODate(input.eventDate, -t.daysBefore),
  }));
}

/** Turns a kept suggestion into the values the store needs to create a task. */
export function toTaskInput(
  task: ProposedTask,
  links: { assigneeId: string; eventId?: string; sponsorId?: string }
): TaskInput {
  return {
    title: task.title,
    dueDate: task.dueDate,
    assigneeId: links.assigneeId,
    eventId: links.eventId,
    sponsorId: links.sponsorId,
    notes: task.description,
  };
}
