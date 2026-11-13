"use client";

import { useEffect } from "react";

import { useSaveError } from "./planner-provider";
import { useToast } from "./toast-provider";

/**
 * Shows a red toast when the database could not load or save something,
 * then clears the error so it is shown once. Draws nothing itself.
 */
export function SaveErrorToast() {
  const { saveError, clearSaveError } = useSaveError();
  const toast = useToast();

  useEffect(() => {
    if (!saveError) return;
    toast({ title: "Database problem", description: saveError, kind: "error" });
    clearSaveError();
  }, [saveError, clearSaveError, toast]);

  return null;
}
