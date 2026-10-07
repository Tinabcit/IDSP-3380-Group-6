import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins CSS class names together. If two classes clash, the LAST one wins,
 * e.g. cn("p-2", "p-4") gives "p-4". Used all over the components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
