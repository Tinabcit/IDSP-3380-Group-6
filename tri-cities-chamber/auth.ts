import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Google sign-in (Auth.js). Needs AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
 * in .env.local (see .env.example). Google has no separate "sign up", so Sign Up and Login
 * run the same flow: a new Google account is simply accepted the first time it signs in.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
});
