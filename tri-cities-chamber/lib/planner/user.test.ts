import { describe, expect, it } from 'vitest';
import { getDisplayUser, getInitials } from './user';

describe('getInitials', () => {
  it('uses the first letters of the first two words', () => {
    expect(getInitials('Shervin Babaei')).toBe('SB');
    expect(getInitials('ada mary lovelace')).toBe('AM');
  });

  it('handles a single word and blank names', () => {
    expect(getInitials('Madonna')).toBe('M');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('getDisplayUser', () => {
  it('uses the Google name, email and photo when signed in', () => {
    expect(getDisplayUser({ name: 'Shervin Babaei', email: 's@x.com', image: 'http://img' })).toEqual({
      name: 'Shervin Babaei',
      email: 's@x.com',
      image: 'http://img',
      initials: 'SB',
      signedIn: true,
    });
  });

  it('falls back to the email when there is no name', () => {
    const u = getDisplayUser({ email: 's@x.com' });
    expect(u.name).toBe('s@x.com');
    expect(u.signedIn).toBe(true);
  });

  it('shows Unknown user when nobody is signed in', () => {
    expect(getDisplayUser(undefined)).toEqual({
      name: 'Unknown user',
      email: 'unknown@...',
      image: null,
      initials: 'U',
      signedIn: false,
    });
  });
});
