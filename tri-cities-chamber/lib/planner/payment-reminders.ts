
import { isISODateBefore, shiftISODate } from "./dates";
import type { ISODate } from "./types";

/** Describes the current status of a sponsorship payment. */
export type PaymentReminderStatus =
  | "paid"
  | "overdue"
  | "urgent"
  | "upcoming"
  | "active"
  | "none";

/** Checks how close a sponsorship payment is to its due date. */
export function getPaymentReminderStatus(
  dueDate: ISODate | undefined,
  today: ISODate,
  isPaid = false
): PaymentReminderStatus {
  if (isPaid) {
    return "paid";
  }

  if (!dueDate) {
    return "none";
  }

  if (isISODateBefore(dueDate, today)) {
    return "overdue";
  }

  if (dueDate <= shiftISODate(today, 7)) {
    return "urgent";
  }

  if (dueDate <= shiftISODate(today, 30)) {
    return "upcoming";
  }

  return "active";
}

/** Generates a message for an upcoming or overdue payment. */
export function getPaymentReminderMessage(
  sponsorName: string,
  dueDate: ISODate,
  status: PaymentReminderStatus
): string {
  switch (status) {
    case "overdue":
      return `${sponsorName}'s sponsorship payment was due on ${dueDate}.`;

    case "urgent":
      return `${sponsorName}'s sponsorship payment is due soon (${dueDate}).`;

    case "upcoming":
      return `${sponsorName}'s sponsorship payment is coming up on ${dueDate}.`;

    case "paid":
      return `${sponsorName}'s sponsorship payment has been received.`;

    default:
      return `No immediate payment reminder for ${sponsorName}.`;
  }
}
