
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

import { ThemeMenu } from "./theme-menu";

/** Ends the session and returns to the landing page. */
async function googleSignOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}

/** Shows navigation buttons depending on login status. */
async function AuthButtons() {
  // Wait for a real request before checking the session.
  await connection();
  const session = await auth();

  if (session) {
    return (
      <>
        <Button asChild variant="secondary" size="sm">
          <Link href="/home">Go to app</Link>
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
      <Button asChild variant="secondary" size="sm">
        <Link href="/signup">Sign Up</Link>
      </Button>

      <Button
        asChild
        size="sm"
        className="bg-landing-login text-white hover:bg-landing-login/90"
      >
        <Link href="/login">Login</Link>
      </Button>
    </>
  );
}

/** Start now button based on authentication status. */
async function StartNowButton() {
  await connection();
  const session = await auth();

  return (
    <Button
      asChild
      size="lg"
      className="mt-12 bg-landing-cta px-6 text-xl text-white hover:bg-landing-cta/90"
    >
      <Link href={session ? "/home" : "/signup"}>
        Start now
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>
    </Button>
  );
}

/** Landing page */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-8">

        {/* Logo */}
        <span className="flex items-center gap-2 text-xl font-bold">
          <Image
            src="/tudu-logo.png"
            alt=""
            width={407}
            height={408}
            className="h-10 w-10"
          />
          Tu Du
        </span>

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <AuthButtons />
          </Suspense>

          <ThemeMenu />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center bg-landing-hero px-4 py-20 text-center text-landing-hero-foreground">

        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Where teams Create together.
        </h1>

        <p className="mt-10 max-w-2xl text-base sm:text-lg">
          Capture context, find answers, and automate tasks with AI built for your team.
        </p>

        <Suspense
          fallback={
            <Button
              size="lg"
              disabled
              className="mt-12 bg-landing-cta px-6 text-xl text-white"
            >
              Start now
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          }
        >
          <StartNowButton />
        </Suspense>

      </main>
    </div>
  );
}
