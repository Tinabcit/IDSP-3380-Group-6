
import { isISODateBefore, shiftISODate } from "./dates";
import type { ISODate } from "./types";

/** Describes how close a contract deadline is. */
export type ContractDeadlineStatus =
  | "expired"
  | "urgent"
  | "upcoming"
  | "active"
  | "none";

/** Classifies a contract expiration or renewal deadline. */
export function getContractDeadlineStatus(
  deadline: ISODate | undefined,
  today: ISODate
): ContractDeadlineStatus {
  if (!deadline) {
    return "none";
  }

  if (isISODateBefore(deadline, today)) {
    return "expired";
  }

  if (deadline <= shiftISODate(today, 7)) {
    return "urgent";
  }

  if (deadline <= shiftISODate(today, 30)) {
    return "upcoming";
  }

  return "active";
}
