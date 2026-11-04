/*
 * LANDING PAGE (shown at "/"). Edit the JSX in LandingPage() at the bottom of this file.
 * The sign-in functions above it can stay as they are. Build new parts of the page in
 * components/landing/sections/. Guide: docs/PAGE_STARTER_GUIDE.md
 */
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";

import { auth, signIn, signOut } from "@/auth";
import { AUTH_DISABLED } from "@/proxy";
import { Button } from "@/components/ui/button";

import { HeroSection } from "./sections/hero-section";
import { ThemeMenu } from "./theme-menu";

/** Starts the Google sign-in and sends the person to the app afterwards. */
async function googleSignIn() {
  "use server";
  await signIn("google", { redirectTo: "/home" });
}

/** Ends the session and stays on the landing page. */
async function googleSignOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}

/** The Sign Up / Login buttons, or "Go to app" / Sign out when someone is already signed in. */
async function AuthButtons() {
  // Wait for a real request first: reading the session uses random values that cannot be prerendered.
  await connection();
  // With auth switched off, skip the session lookup and always show "Go to app".
  const session = AUTH_DISABLED ? true : await auth();

  if (session) {
    return (
      <>
        <Button render={<Link href="/home" />} nativeButton={false}>Go to app</Button>
        <form action={googleSignOut}>
          <Button type="submit">Sign out</Button>
        </form>
      </>
    );
  }

  return (
    <>
      <form action={googleSignIn}>
        <Button type="submit">Sign Up</Button>
      </form>
      <form action={googleSignIn}>
        <Button type="submit">Login</Button>
      </form>
    </>
  );
}

/** The first page visitors see. Build it here: add your own sections and styles. */
export function LandingPage() {
  return (
    <div>
      <header>
        <span>Tu Du</span>
        {/* Sign Up / Login (they work already) and the Theme menu. Style or move them as you like. */}
        <Suspense fallback={null}>
          <AuthButtons />
        </Suspense>
        <ThemeMenu />
      </header>

      {/* Your sections go here. Make them in components/landing/sections/. */}
      <HeroSection title="Page title" subtitle="A short sentence about the app." />
    </div>
  );
}
