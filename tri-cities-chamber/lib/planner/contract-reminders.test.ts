
import { describe, expect, it } from "vitest";

import { getContractDeadlineStatus } from "./contract-reminders";


/**
 * Tests the different expiration and renewal deadline statuses
 * using fixed dates so the results are consistent.
 */
describe("getContractDeadlineStatus", () => {
  const today = "2026-10-20";

  it("identifies expired contracts", () => {
    expect(
      getContractDeadlineStatus("2026-10-19", today)
    ).toBe("expired");
  });

  it("marks deadlines today as urgent", () => {
    expect(
      getContractDeadlineStatus("2026-10-20", today)
    ).toBe("urgent");
  });

  it("marks deadlines within 7 days as urgent", () => {
    expect(
      getContractDeadlineStatus("2026-10-25", today)
    ).toBe("urgent");
  });

  it("marks deadlines within 30 days as upcoming", () => {
    expect(
      getContractDeadlineStatus("2026-11-09", today)
    ).toBe("upcoming");
  });

  it("marks deadlines more than 30 days away as active", () => {
    expect(
      getContractDeadlineStatus("2026-12-20", today)
    ).toBe("active");
  });

  it("handles missing deadlines", () => {
    expect(
      getContractDeadlineStatus(undefined, today)
    ).toBe("none");
  });

  it("handles the 7-day boundary", () => {
    expect(
      getContractDeadlineStatus("2026-10-27", today)
    ).toBe("urgent");
  });

  it("handles the 30-day boundary", () => {
    expect(
      getContractDeadlineStatus("2026-11-19", today)
    ).toBe("upcoming");
  });
});
