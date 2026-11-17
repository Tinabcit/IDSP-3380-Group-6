"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@/lib/utils";

/** Base UI parts accept a function as className; ours only take text so cn() can merge them. */
type WithClass<P> = Omit<P, "className"> & { className?: string };

/** The round frame that holds a picture or the fallback letters. */
function Avatar({ className, ...props }: WithClass<AvatarPrimitive.Root.Props>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

/** The picture inside the avatar. */
function AvatarImage({ className, ...props }: WithClass<AvatarPrimitive.Image.Props>) {
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square h-full w-full", className)} {...props} />
  );
}

/** Shown when there is no picture or it fails to load (usually the initials). */
function AvatarFallback({ className, ...props }: WithClass<AvatarPrimitive.Fallback.Props>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-sky-600 text-xs font-medium text-white", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
