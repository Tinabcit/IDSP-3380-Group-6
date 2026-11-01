import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

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
  const session = await auth();

  if (session) {
    return (
      <>
        <Button asChild variant="secondary" size="sm">
          <Link href="/home">Go to app</Link>
        </Button>
        <form action={googleSignOut}>
          <Button type="submit" size="sm" className="bg-landing-login text-white hover:bg-landing-login/90">
            Sign out
          </Button>
        </form>
      </>
    );
  }

  return (
    <>
      <form action={googleSignIn}>
        <Button type="submit" variant="secondary" size="sm">
          Sign Up
        </Button>
      </form>
      <form action={googleSignIn}>
        <Button type="submit" size="sm" className="bg-landing-login text-white hover:bg-landing-login/90">
          Login
        </Button>
      </form>
    </>
  );
}

/** The first page visitors see: header (Sign Up, Login, Theme) and the hero with "Start now". */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-8">
        <span className="text-xl font-bold">Tu Du</span>
        <div className="flex flex-wrap items-center gap-3">
          {/* The session is only known at request time, so the buttons stream in. */}
          <Suspense fallback={null}>
            <AuthButtons />
          </Suspense>
          <ThemeMenu />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center bg-landing-hero px-4 py-20 text-center text-landing-hero-foreground">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">Where teams Create together.</h1>
        <p className="mt-10 max-w-2xl text-base sm:text-lg">
          Capture context, find answers, and automate tasks with AI built for your team.
        </p>
        <Button asChild size="lg" className="mt-12 bg-landing-cta px-6 text-xl text-white hover:bg-landing-cta/90">
          <Link href="/home">
            Start now <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </Button>
      </main>
    </div>
  );
}
