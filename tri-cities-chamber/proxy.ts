import { NextResponse } from "next/server";

import { auth } from "@/auth";

/** The pages that need a signed-in person. */
const PROTECTED = ["/home", "/calendar", "/contracts", "/events", "/partners", "/dashboard", "/settings"];

/** Temporary dev switch: true lets everyone into every page without signing in. Set to false to turn login back on. */
export const AUTH_DISABLED = true;

/** Sends signed-out visitors of an app page back to the landing page. */
const requireLogin = auth((req) => {
  const { pathname } = req.nextUrl;
  const needsLogin = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (needsLogin && !req.auth) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
});

/** Lets every request through when auth is switched off, otherwise checks the login. */
export default AUTH_DISABLED ? () => NextResponse.next() : requireLogin;

/** Skip the auth routes, Next.js internals and files with an extension (images, icons). */
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|.*\\..*).*)"],
};
