
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeMenu } from "./theme-menu";

/**
 * Signs the user out and returns them to the landing page.
 */
async function googleSignOut() {
  "use server";

  await signOut({
    redirectTo: "/",
  });
}

/**
 * Displays Login and Sign Up buttons for visitors.
 * Displays Go to App and Sign Out for signed-in users.
 */
async function AuthButtons() {
  await connection();

  const session = await auth();

  if (session) {
    return (
      <>
        <Button
          render={<Link href="/home" />}
          nativeButton={false}
          variant="secondary"
          size="sm"
        >
          Go to app
        </Button>

        <form action={googleSignOut}>
          <Button
            type="submit"
            size="sm"
            className="bg-landing-login text-white hover:bg-landing-login/90"
          >
            Sign out
          </Button>
        </form>
      </>
    );
  }

  return (
    <>
      <Button
        render={<Link href="/signup" />}
        nativeButton={false}
        variant="secondary"
        size="sm"
      >
        Sign Up
      </Button>

      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        size="sm"
        className="bg-landing-login text-white hover:bg-landing-login/90"
      >
        Login
      </Button>
    </>
  );
}

/**
 * Sends signed-in users to Home.
 * Sends visitors to the Sign Up page.
 */
async function StartNowButton() {
  await connection();

  const session = await auth();

  const destination = session ? "/home" : "/signup";

  return (
    <Button
      render={<Link href={destination} />}
      nativeButton={false}
      size="lg"
      className="mt-12 gap-2 bg-landing-cta px-6 text-xl text-white hover:bg-landing-cta/90"
    >
      Start now

      <ArrowRight
        className="h-5 w-5"
        aria-hidden="true"
      />
    </Button>
  );
}

/**
 * Main TuDu landing page.
 */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-8">
        {/* Logo */}
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

          <span>Tu Du</span>
        </Link>

        {/* Authentication and Theme */}
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <AuthButtons />
          </Suspense>

          <ThemeMenu />
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex flex-1 flex-col items-center justify-center bg-landing-hero px-4 py-20 text-center text-landing-hero-foreground">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Where teams Create together.
        </h1>

        <p className="mt-10 max-w-2xl text-base sm:text-lg">
          Capture context, find answers, and automate
          tasks with AI built for your team.
        </p>

        <Suspense
          fallback={
            <Button
              disabled
              size="lg"
              className="mt-12 gap-2 bg-landing-cta px-6 text-xl text-white"
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
