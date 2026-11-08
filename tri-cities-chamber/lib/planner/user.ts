/** The person shown in the sidebar footer. */
export type DisplayUser = {
  name: string;
  email: string;
  image: string | null;
  initials: string;
  signedIn: boolean;
};

/** The parts of the Auth.js session user that we read. */
type SessionUser = { name?: string | null; email?: string | null; image?: string | null };

/** Turns a name into one or two capital letters for the avatar fallback. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Builds what the sidebar shows from the session user, or the "Unknown user" placeholder. */
export function getDisplayUser(user: SessionUser | null | undefined): DisplayUser {
  if (!user || (!user.name && !user.email)) {
    return { name: 'Unknown user', email: 'unknown@...', image: null, initials: 'U', signedIn: false };
  }
  const name = user.name || user.email || 'Unknown user';
  return {
    name,
    email: user.email || 'unknown@...',
    image: user.image || null,
    initials: getInitials(name),
    signedIn: true,
  };
}
