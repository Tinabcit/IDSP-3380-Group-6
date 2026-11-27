
"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { googleSignIn } from "../auth-actions";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(
      "Email registration is not configured yet. Please use Google."
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">

      {/* Main Sign Up Section */}
      <main className="flex flex-1 justify-center bg-landing-hero px-4 py-12 text-landing-hero-foreground">

        <div className="w-full max-w-125">

          {/* Page Heading */}
          <div className="mb-12 text-center">

            <h1 className="text-3xl font-normal">
              CREATE AN ACCOUNT
            </h1>

            <p className="mt-2 text-sm">
              Join Tu Du and start creating together
            </p>

          </div>

          {/* Google Sign Up */}
          <form
            action={googleSignIn}
            className="mb-8 flex justify-center"
          >
            <Button
              type="submit"
              variant="outline"
              className="rounded-full bg-background px-5 text-foreground hover:bg-background/90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="mr-2 h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.89 46.98 24.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.89 23.89 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>

              Sign up with Google
            </Button>
          </form>

          {/* Divider */}
          <div className="mb-8 flex items-center gap-3">

            <div className="h-px flex-1 bg-foreground/20" />

            <span className="text-sm">
              Or
            </span>

            <div className="h-px flex-1 bg-foreground/20" />

          </div>

          {/* Account Information */}
          <div className="rounded-xl border border-foreground/15 bg-background p-6 text-foreground">

            <h2 className="text-xl font-medium">
              ACCOUNT INFORMATION
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Enter your details to create an account
            </p>

            {/* Registration Form */}
            <form
              id="signup-form"
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm"
                >
                  Full name *
                </label>

                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm"
                >
                  Email address *
                </label>

                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm"
                >
                  Password *
                </label>

                <div className="relative">

                  <Input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl pr-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm"
                >
                  Confirm password *
                </label>

                <div className="relative">

                  <Input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="h-11 rounded-xl pr-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>
              </div>

            </form>
          </div>

          {/* Create Account Button */}
          <Button
            type="submit"
            form="signup-form"
            className="mt-10 h-12 w-full rounded-xl bg-landing-cta text-white hover:bg-landing-cta/90"
          >
            Create account
          </Button>

          {/* Error Message */}
          {error && (
            <p
              role="alert"
              className="mt-3 text-center text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* Bottom Divider */}
          <div className="mt-8 flex items-center gap-3">

            <div className="h-px flex-1 bg-foreground/20" />

            <span className="text-sm">
              Or
            </span>

            <div className="h-px flex-1 bg-foreground/20" />

          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">

            <Link
              href="/login"
              className="text-sm font-medium hover:underline"
            >
              Already have an account? Sign in
            </Link>

          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">

            <Link
              href="/"
              className="text-sm hover:underline"
            >
              Back to Home
            </Link>

          </div>

        </div>
      </main>
    </div>
  );
}
