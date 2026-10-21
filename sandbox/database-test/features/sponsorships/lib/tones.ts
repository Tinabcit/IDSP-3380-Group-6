export type Tone = "success" | "info" | "warning" | "danger" | "muted" | "accent";

/** Every status/rank value in the schema mapped to a colour tone. */
export const STATUS_TONE: Record<string, Tone> = {
  // general / events / sponsors
  active: "success",
  open: "success",
  confirmed: "success",
  planning: "info",
  offered: "info",
  upcoming: "info",
  prospective: "warning",
  pending_renewal: "warning",
  due: "warning",
  overdue: "danger",
  expired: "danger",
  declined: "danger",
  completed: "muted",
  cancelled: "muted",
  inactive: "muted",
  // ranks
  pillar: "accent",
  annual_partner: "info",
  event_only: "muted",
};

export const TONE_BADGE: Record<Tone, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  muted: "border-border bg-muted text-muted-foreground",
  accent:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
};

export const TONE_TEXT: Record<Tone, string> = {
  success: "text-emerald-700 dark:text-emerald-400",
  info: "text-sky-700 dark:text-sky-400",
  warning: "text-amber-700 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400 font-medium",
  muted: "text-muted-foreground",
  accent: "text-violet-700 dark:text-violet-400",
};
