
import { describe, expect, it } from "vitest";
import { getPaymentNotifications } from "./payment-notifications";
import type { Contract, Sponsor } from "./types";

const sponsors: Sponsor[] = [
  { id: "s1", name: "ABC Company" },
];

const contract: Contract = {
  id: "c1",
  title: "Annual Sponsorship",
  sponsorId: "s1",
  amount: 5000,
  status: "active",
  payments: [
    {
      id: "p1",
      label: "Deposit",
      dueDate: "2026-10-20",
      amount: 2500,
      paid: false,
    },
    {
      id: "p2",
      label: "Final Balance",
      dueDate: "2026-10-30",
      amount: 2500,
      paid: false,
    },
  ],
  deliverables: [],
  createdAt: "2026-10-01T12:00:00Z",
};

describe("Payment notifications", () => {
  const today = "2026-10-27";

  it("creates notifications for unpaid payments", () => {
    const result = getPaymentNotifications(
      [contract],
      sponsors,
      today
    );

    expect(result).toHaveLength(2);
  });

  it("identifies overdue payments", () => {
    const result = getPaymentNotifications(
      [contract],
      sponsors,
      today
    );

    expect(result[0].status).toBe("overdue");
  });

  it("identifies urgent payments", () => {
    const result = getPaymentNotifications(
      [contract],
      sponsors,
      today
    );

    expect(result[1].status).toBe("urgent");
  });

  it("does not notify for paid payments", () => {
    const paidContract: Contract = {
      ...contract,
      payments: contract.payments.map((p) => ({
        ...p,
        paid: true,
      })),
    };

    expect(
      getPaymentNotifications(
        [paidContract],
        sponsors,
        today
      )
    ).toHaveLength(0);
  });

  it("does not notify for completed contracts", () => {
    expect(
      getPaymentNotifications(
        [{ ...contract, status: "completed" }],
        sponsors,
        today
      )
    ).toHaveLength(0);
  });
});
