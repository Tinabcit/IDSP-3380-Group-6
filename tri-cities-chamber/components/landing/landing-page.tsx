
/*
 * LANDING PAGE (shown at "/"). Edit the JSX in LandingPage() at the bottom of this file.
 * The sign-in functions above it can stay as they are. Build new parts of the page in
 * components/landing/sections/. Guide: docs/PAGE_STARTER_GUIDE.md
 *
 */

/*
 * LANDING PAGE
 * Route: "/"
 *
 * TuDu landing page with authentication,
 * signup, login, theme selection,
 * and Start Now navigation.
 */

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";

import { auth, signOut } from "@/auth";
import { AUTH_DISABLED } from "@/proxy";
import { Button } from "@/components/ui/button";
import { ThemeMenu } from "./theme-menu";

// --------------------------------------------------
// Google Sign Out
// --------------------------------------------------

async function googleSignOut() {
  "use server";

  await signOut({
    redirectTo: "/",
  });
}

// --------------------------------------------------
// Authentication Buttons
// --------------------------------------------------

async function AuthButtons() {
  await connection();

  const session = AUTH_DISABLED
    ? true
    : await auth();

  // User is signed in.
  if (session) {
    return (
      <>
        <Button
          asChild
          variant="secondary"
          size="sm"
        >
          <Link href="/home">
            Go to app
          </Link>
        </Button>

        {!AUTH_DISABLED && (
          <form action={googleSignOut}>
            <Button
              type="submit"
              size="sm"
              className="bg-landing-login text-white hover:bg-landing-login/90"
            >
              Sign out
            </Button>
          </form>
        )}
      </>
    );
  }

  // User is not signed in.
  return (
    <>
      <Button
        asChild
        variant="secondary"
        size="sm"
      >
        <Link href="/signup">
          Sign Up
        </Link>
      </Button>

      <Button
        asChild
        size="sm"
        className="bg-landing-login text-white hover:bg-landing-login/90"
      >
        <Link href="/login">
          Login
        </Link>
      </Button>
    </>
  );
}

// --------------------------------------------------
// Start Now Button
// --------------------------------------------------

async function StartNowButton() {
  await connection();

  const session = AUTH_DISABLED
    ? true
    : await auth();

  return (
    <Button
      asChild
      size="lg"
      className="mt-12 bg-landing-cta px-6 text-xl text-white hover:bg-landing-cta/90"
    >
      <Link
        href={session ? "/home" : "/signup"}
      >
        Start now

        <ArrowRight
          className="h-5 w-5"
          aria-hidden="true"
        />
      </Link>
    </Button>
  );
}

// --------------------------------------------------
// Landing Page
// --------------------------------------------------

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">

      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-8">

        {/* TuDu Logo */}

        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold"
          aria-label="TuDu home"
        >
          <Image
            src="/tudu-logo.png"
            alt="TuDu logo"
            width={407}
            height={408}
            priority
            className="h-10 w-10 object-contain"
          />

          <span>
            Tu Du
          </span>
        </Link>

        {/* Navigation */}

        <div className="flex flex-wrap items-center gap-3">

          <Suspense fallback={null}>
            <AuthButtons />
          </Suspense>

          <ThemeMenu />

        </div>
      </header>

      {/* -------------------------------- */}
      {/* Hero Section */}
      {/* -------------------------------- */}

      <main className="flex flex-1 flex-col items-center justify-center bg-landing-hero px-4 py-20 text-center text-landing-hero-foreground">

        {/* Main Heading */}

        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Where teams Create together.
        </h1>

        {/* Description */}

        <p className="mt-10 max-w-2xl text-base sm:text-lg">
          Capture context, find answers, and automate tasks
          with AI built for your team.
        </p>

        {/* Start Now */}

        <Suspense
          fallback={
            <Button
              size="lg"
              disabled
              className="mt-12 bg-landing-cta px-6 text-xl text-white"
            >
              Start now

              <ArrowRight
                className="h-5 w-5"
                aria-hidden="true"
              />
            </Button>
          }
        >
          <StartNowButton />
        </Suspense>

      </main>
    </div>
  );
}
