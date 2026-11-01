import { describe, expect, it } from 'vitest';
import { parseThemeChoice, resolveTheme } from './theme';

describe('parseThemeChoice', () => {
  it('accepts the three valid choices', () => {
    expect(parseThemeChoice('default')).toBe('default');
    expect(parseThemeChoice('light')).toBe('light');
    expect(parseThemeChoice('dark')).toBe('dark');
  });

  it('falls back to default for anything else', () => {
    expect(parseThemeChoice(null)).toBe('default');
    expect(parseThemeChoice('blue')).toBe('default');
    expect(parseThemeChoice('')).toBe('default');
  });
});

describe('resolveTheme', () => {
  it('follows the system for default', () => {
    expect(resolveTheme('default', true)).toBe('dark');
    expect(resolveTheme('default', false)).toBe('light');
  });

  it('ignores the system for light and dark', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});
