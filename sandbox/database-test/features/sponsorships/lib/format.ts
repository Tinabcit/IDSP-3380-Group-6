import type { Tone } from "./tones";

export const DAY_MS = 86_400_000;

const TIME_ZONE = process.env.DISPLAY_TIME_ZONE || "UTC";

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: TIME_ZONE });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});
// Postgres `date` columns arrive as UTC midnight; format them in UTC so they
// don't shift a day in negative-offset time zones.
const dateOnlyFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export const formatDate = (d?: Date | null) => (d ? dateFmt.format(d) : "—");
export const formatDateTime = (d?: Date | null) => (d ? dateTimeFmt.format(d) : "—");
export const formatDateOnly = (d?: Date | null) => (d ? dateOnlyFmt.format(d) : "—");

/** "pending_renewal" → "Pending renewal" */
export function humanize(value: string) {
  const s = value.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function plural(n: number, word: string, pluralWord = `${word}s`) {
  return `${n} ${n === 1 ? word : pluralWord}`;
}

/** Relative label + tone for a deadline. */
export function dueLabel(
  due: Date | null | undefined,
  now: Date,
  soonDays = 7,
): { text: string; tone: Tone } {
  if (!due) return { text: "Not scheduled", tone: "muted" };
  const days = Math.round((due.getTime() - now.getTime()) / DAY_MS);
  if (due < now) {
    return { text: days === 0 ? "Due today" : `${plural(-days, "day")} overdue`, tone: "danger" };
  }
  if (days === 0) return { text: "Due today", tone: "warning" };
  return { text: `In ${plural(days, "day")}`, tone: days <= soonDays ? "warning" : "muted" };
}
