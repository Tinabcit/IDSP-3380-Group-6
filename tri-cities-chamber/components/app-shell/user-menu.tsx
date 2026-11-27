
"use client";

import {
  ChevronsUpDown,
  LogIn,
  LogOut,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { DisplayUser } from "@/lib/planner/user";

import {
  googleSignIn,
  googleSignOut,
} from "./auth-actions";

/**
 * Displays the user's avatar, name, and email.
 */
function UserInfo({
  user,
}: {
  user: DisplayUser;
}) {
  return (
    <>
      <Avatar>
        {user.image && (
          <AvatarImage
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
          />
        )}

        <AvatarFallback>
          {user.initials}
        </AvatarFallback>
      </Avatar>

      <span className="grid min-w-0 flex-1 text-left leading-tight">
        <span className="truncate text-sm font-semibold">
          {user.name}
        </span>

        <span className="truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </span>
    </>
  );
}

/**
 * Sidebar user menu.
 *
 * Shows the current user's information and
 * provides Sign out or Log in functionality.
 */
export function UserMenu({
  user,
}: {
  user: DisplayUser;
}) {
  return (
    <DropdownMenu>
      {/* User menu trigger */}
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2 rounded-md p-1 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <UserInfo user={user} />

        <ChevronsUpDown
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      {/* Dropdown content */}
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-56"
      >
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <UserInfo user={user} />
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Authentication action */}
        <form
          action={
            user.signedIn
              ? googleSignOut
              : googleSignIn
          }
        >
          <DropdownMenuItem
            nativeButton={true}
            render={<button type="submit" />}
            className="w-full cursor-pointer"
          >
            {user.signedIn ? (
              <LogOut
                className="h-4 w-4"
                aria-hidden="true"
              />
            ) : (
              <LogIn
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}

            <span>
              {user.signedIn
                ? "Sign out"
                : "Log in"}
            </span>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
