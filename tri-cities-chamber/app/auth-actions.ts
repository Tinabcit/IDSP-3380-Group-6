
"use server";

import { signIn } from "@/auth";

/**
 * Opens Google authentication.
 * After successful login, redirects to the Tu Du dashboard.
 */
export async function googleSignIn() {
  await signIn(
    "google",
    {
      redirectTo: "/home",
    },
    {
      prompt: "select_account",
    }
  );
}
