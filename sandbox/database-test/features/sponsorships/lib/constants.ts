export const BASE_PATH = "/sandbox/sponsorships";

/** sponsor_advertising statuses that still need work. */
export const OPEN_AD_STATUSES = ["upcoming", "due"] as const;

/** events statuses where tickets can still be sent. */
export const ACTIVE_EVENT_STATUSES = ["planning", "open"] as const;

/** Sponsorship statuses that count as "sponsored this event". */
export const COMMITTED_SPONSORSHIP_STATUSES = ["confirmed", "completed"] as const;

export const RANK_ORDER: Record<string, number> = {
  pillar: 0,
  annual_partner: 1,
  event_only: 2,
};

/** Renewal contacts due within this many days are flagged. */
export const RENEWAL_WINDOW_DAYS = 30;

/** Ad deliverables due within this many days count as "due soon". */
export const DUE_SOON_DAYS = 7;
