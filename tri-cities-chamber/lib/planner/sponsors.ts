import type { Sponsor, SponsorInput, SponsorLevel, SponsorTodo } from "./types";

/** Every sponsorship level with the label shown to people. The order is the order in the dropdown. */
export const SPONSOR_LEVELS: { value: SponsorLevel; label: string }[] = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
];

/** The checklist every new sponsor starts with. Ids are filled in when the form opens. */
export const DEFAULT_SPONSOR_TODOS: SponsorTodo[] = [
  { id: "todo-agreement", title: "Send sponsorship agreement to sponsor", done: false },
  { id: "todo-logo", title: "Request logo assets (SVG and PNG)", done: false },
  { id: "todo-booth", title: "Confirm sponsorship level and booth placement", done: false },
  { id: "todo-onboarding", title: "Schedule onboarding call with sponsor team", done: false },
];

/** The label people see for a level, e.g. "Gold". Empty when the sponsor has no level. */
export function levelLabel(level: SponsorLevel | undefined): string {
  return SPONSOR_LEVELS.find((l) => l.value === level)?.label ?? "";
}

/** True only for a sponsor that was saved but not published. Older sponsors count as active. */
export function isDraft(sponsor: Pick<Sponsor, "status">): boolean {
  return sponsor.status === "draft";
}

/**
 * Checks the values from the sponsor form. Returns a sentence to show the
 * user, or null when everything is fine. Email and website are optional.
 */
export function validateSponsorInput(input: SponsorInput): string | null {
  if (!input.name.trim()) return "Enter a sponsor name.";
  const email = input.contactEmail?.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  const website = input.website?.trim();
  if (website && !isHttpUrl(website)) return "Enter a website starting with http:// or https://.";
  return null;
}

/** True when the text is a web address using http or https. */
function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
