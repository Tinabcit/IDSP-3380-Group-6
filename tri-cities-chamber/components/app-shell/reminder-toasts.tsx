"use client";

import { useEffect } from "react";

import { dueSoonTasks, reminderMessage } from "@/lib/planner/reminders";

import { useOptionalPlannerData } from "./planner-provider";
import { useToast } from "./toast-provider";

/** The browser storage name for "reminders already shown today". */
const SHOWN_KEY = "partner-calendar:reminders-shown:v1";

/** Reads the ids already shown for `today`. A new day starts with an empty list. */
function readShown(today: string): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SHOWN_KEY) ?? "null");
    return parsed && parsed.date === today && Array.isArray(parsed.ids) ? parsed.ids : [];
  } catch {
    return [];
  }
}

/** Remembers which reminders were shown today, so a page refresh does not repeat them. */
function writeShown(today: string, ids: string[]) {
  try {
    window.localStorage.setItem(SHOWN_KEY, JSON.stringify({ date: today, ids }));
  } catch {
    // Storage blocked: reminders may repeat after a refresh, which is harmless.
  }
}

/**
 * Draws nothing. Once the data is loaded (and whenever the signed-in person,
 * the day or the tasks change) it shows a bell toast for each of their open
 * tasks due in 1-2 days, at most once per task per day.
 */
export function ReminderToasts() {
  const data = useOptionalPlannerData();
  const toast = useToast();

  const tasks = data?.tasks;
  const today = data?.today;
  const userId = data?.currentUserId;

  useEffect(() => {
    if (!tasks || !today || !userId) return;
    const shown = readShown(today);
    const fresh = dueSoonTasks(tasks, today, userId).filter((t) => !shown.includes(`${userId}:${t.id}`));
    if (fresh.length === 0) return;
    writeShown(today, [...shown, ...fresh.map((t) => `${userId}:${t.id}`)]);
    for (const t of fresh) {
      toast({ kind: "reminder", title: "Coming up", description: reminderMessage(t, today) });
    }
  }, [tasks, today, userId, toast]);

  return null;
}
