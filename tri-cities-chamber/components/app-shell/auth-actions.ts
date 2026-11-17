"use server";

import { signIn, signOut } from "@/auth";

/** Starts the Google sign-in and comes back to the app. */
export async function googleSignIn() {
  await signIn("google", { redirectTo: "/home" });
}

/** Ends the session and goes to the landing page. */
export async function googleSignOut() {
  await signOut({ redirectTo: "/" });
}
