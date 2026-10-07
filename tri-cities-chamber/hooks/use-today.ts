'use client';

import { useSyncExternalStore } from 'react';

import { todayISO } from '@/lib/planner/dates';
import type { ISODate } from '@/lib/planner/types';

/**
 * Tells React when to check the date again: every minute, and when the browser
 * tab becomes visible again. Returns a function that stops the checking.
 */
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.clearInterval(id);
    document.removeEventListener('visibilitychange', onChange);
  };
}

/** What React reads in the browser: today's date. React only redraws when this changes. */
const getSnapshot = (): ISODate | null => todayISO();

// The server never reads the clock, so nothing time-dependent is prerendered.
/**
 * What React uses on the server: always null, because the server must not
 * depend on the clock (otherwise the server and browser pages would not match).
 */
const getServerSnapshot = (): ISODate | null => null;

/**
 * Current date as an ISO string, or null on the server and during the first
 * client render. Updates at midnight if the tab stays open.
 */
export function useToday(): ISODate | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
