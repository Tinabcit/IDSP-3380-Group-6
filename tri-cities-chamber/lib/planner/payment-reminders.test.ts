
import { describe, expect, it } from "vitest";
import {
  getPaymentReminderStatus,
  getPaymentReminderMessage,
} from "./payment-reminders";

describe("Sponsorship payment reminders", () => {
  const today = "2026-10-27";

  it("returns none when there is no payment due date", () => {
    expect(getPaymentReminderStatus(undefined, today)).toBe("none");
  });

  it("returns paid when payment is completed", () => {
    expect(getPaymentReminderStatus("2026-10-20", today, true)).toBe("paid");
  });

  it("returns overdue when payment date has passed", () => {
    expect(getPaymentReminderStatus("2026-10-20", today)).toBe("overdue");
  });

  it("returns urgent when payment is due within 7 days", () => {
    expect(getPaymentReminderStatus("2026-10-30", today)).toBe("urgent");
  });

  it("returns urgent when payment is due today", () => {
    expect(getPaymentReminderStatus("2026-10-27", today)).toBe("urgent");
  });

  it("returns upcoming when payment is due within 30 days", () => {
    expect(getPaymentReminderStatus("2026-11-15", today)).toBe("upcoming");
  });

  it("returns active when payment is more than 30 days away", () => {
    expect(getPaymentReminderStatus("2026-12-15", today)).toBe("active");
  });

  it("generates an overdue payment notification", () => {
    expect(
      getPaymentReminderMessage("ABC Company", "2026-10-20", "overdue")
    ).toContain("ABC Company");
  });
});
