import { NextResponse } from "next/server";

import { auth } from "@/auth";

/** The pages that need a signed-in person. */
const PROTECTED = ["/home", "/calendar", "/contracts", "/events", "/partners", "/dashboard", "/settings"];

/** Sends signed-out visitors of an app page back to the landing page. */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const needsLogin = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (needsLogin && !req.auth) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
});

/** Skip the auth routes, Next.js internals and files with an extension (images, icons). */
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|.*\\..*).*)"],
};
