
import Link from "next/link";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

async function googleLogin() {
  "use server";
  await signIn("google", { redirectTo: "/home" });
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-landing-hero px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-lg">

        <h1 className="text-3xl font-bold">
          Welcome back!
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Login to your Tu Du account to continue.
        </p>

        <form action={googleLogin} className="mt-8">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-landing-login text-white hover:bg-landing-login/90"
          >
            Continue with Google
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-foreground underline"
          >
            Sign Up
          </Link>
        </p>

        <Link
          href="/"
          className="mt-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
