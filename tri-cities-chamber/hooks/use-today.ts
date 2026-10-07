'use client';

import { useSyncExternalStore } from 'react';

import { todayISO } from '@/lib/planner/dates';
import type { ISODate } from '@/lib/planner/types';

/** Re-check the date every minute and when the tab becomes visible again. */
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.clearInterval(id);
    document.removeEventListener('visibilitychange', onChange);
  };
}

const getSnapshot = (): ISODate | null => todayISO();

// The server never reads the clock, so nothing time-dependent is prerendered.
const getServerSnapshot = (): ISODate | null => null;

/**
 * Current date as an ISO string, or null on the server and during the first
 * client render. Updates at midnight if the tab stays open.
 */
export function useToday(): ISODate | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
