
import { getPaymentReminderStatus } from "./payment-reminders";
import type { Contract, ISODate, Sponsor } from "./types";

export type PaymentNotification = {
  id: string;
  contractId: string;
  paymentId: string;
  sponsorName: string;
  contractTitle: string;
  paymentLabel: string;
  amount: number;
  dueDate: ISODate;
  status: "overdue" | "urgent" | "upcoming";
  message: string;
};

export function getPaymentNotifications(
  contracts: Contract[],
  sponsors: Sponsor[],
  today: ISODate
): PaymentNotification[] {
  const notifications: PaymentNotification[] = [];

  for (const contract of contracts) {
    if (contract.status === "completed") continue;

    const sponsor = sponsors.find(
      (s) => s.id === contract.sponsorId
    );

    const sponsorName = sponsor?.name ?? "Unknown sponsor";

    for (const payment of contract.payments) {
      const status = getPaymentReminderStatus(
        payment.dueDate,
        today,
        payment.paid
      );

      if (
        status !== "overdue" &&
        status !== "urgent" &&
        status !== "upcoming"
      ) {
        continue;
      }

      const message =
        status === "overdue"
          ? `${sponsorName}: ${payment.label} is overdue.`
          : status === "urgent"
          ? `${sponsorName}: ${payment.label} is due soon.`
          : `${sponsorName}: ${payment.label} is coming up.`;

      notifications.push({
        id: `${contract.id}-${payment.id}`,
        contractId: contract.id,
        paymentId: payment.id,
        sponsorName,
        contractTitle: contract.title,
        paymentLabel: payment.label,
        amount: payment.amount,
        dueDate: payment.dueDate,
        status,
        message,
      });
    }
  }

  return notifications.sort(
    (a, b) =>
      a.dueDate.localeCompare(b.dueDate) ||
      a.id.localeCompare(b.id)
  );
}
