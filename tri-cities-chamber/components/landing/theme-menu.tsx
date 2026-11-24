"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  THEME_STORAGE_KEY,
  parseThemeChoice,
  resolveTheme,
  type ThemeChoice,
} from "@/lib/theme";

/** Puts the dark or light look on the whole page by toggling the "dark" class on <html>. */
function applyTheme(choice: ThemeChoice) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", resolveTheme(choice, prefersDark) === "dark");
}

/** The "Theme" button with its Default / Light / Dark menu. The choice is remembered in this browser. */
export function ThemeMenu() {
  const [choice, setChoice] = useState<ThemeChoice>("default");

  // Read the saved choice once the page is in the browser (the server cannot see localStorage).
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChoice(parseThemeChoice(window.localStorage.getItem(THEME_STORAGE_KEY)));
    } catch {
      // Storage can be blocked; the menu then simply starts on Default.
    }
  }, []);

  /** Saves the new choice and applies it right away. */
  function pick(value: string) {
    const next = parseThemeChoice(value);
    setChoice(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Not being able to save is fine; the choice still applies until reload.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          Theme
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={choice} onValueChange={pick}>
          <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
