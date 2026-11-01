/** What the person picked in the Theme menu. "default" means follow the computer's setting. */
export type ThemeChoice = 'default' | 'light' | 'dark';

/** The colours the page can actually show. */
export type ResolvedTheme = 'light' | 'dark';

/** The localStorage key that remembers the choice. */
export const THEME_STORAGE_KEY = 'chamber-theme';

/** Turns a saved string into a valid choice. Anything unknown becomes "default". */
export function parseThemeChoice(value: string | null): ThemeChoice {
  return value === 'light' || value === 'dark' ? value : 'default';
}

/** Works out light or dark from the choice and whether the computer prefers dark. */
export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): ResolvedTheme {
  if (choice === 'default') return prefersDark ? 'dark' : 'light';
  return choice;
}
