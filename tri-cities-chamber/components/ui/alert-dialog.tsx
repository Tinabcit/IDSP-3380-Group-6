"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/** Base UI parts accept a function as className; ours only take text so cn() can merge them. */
type WithClass<P> = Omit<P, "className"> & { className?: string };

/** The whole "Are you sure?" pop-up. Unlike a normal Dialog, clicking outside does not close it. */
const AlertDialog = AlertDialogPrimitive.Root;
/** The thing you click to open the pop-up (use `render` to show your own button). */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
/** Draws the pop-up on top of the page, outside its normal place in the HTML. */
const AlertDialogPortal = AlertDialogPrimitive.Portal;

/** The dark layer behind the pop-up. */
function AlertDialogOverlay({ className, ...props }: WithClass<AlertDialogPrimitive.Backdrop.Props>) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

/** The pop-up box in the middle of the screen. Put the header and footer inside it. */
function AlertDialogContent({ className, ...props }: WithClass<AlertDialogPrimitive.Popup.Props>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-card p-6 shadow-lg duration-200 outline-none data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

/** Holds the title and description. */
function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col space-y-2", className)} {...props} />;
}

/** Holds the buttons (stacked on phones, side by side on bigger screens). */
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

/** The pop-up's heading (screen readers read it out). */
function AlertDialogTitle({ className, ...props }: WithClass<AlertDialogPrimitive.Title.Props>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

/** The explanation text under the heading. */
function AlertDialogDescription({ className, ...props }: WithClass<AlertDialogPrimitive.Description.Props>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The "yes, do it" button (e.g. Delete). Closes the pop-up and runs its onClick. */
function AlertDialogAction({ className, ...props }: WithClass<AlertDialogPrimitive.Close.Props>) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-action"
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

/** The "no, go back" button. Just closes the pop-up. */
function AlertDialogCancel({ className, ...props }: WithClass<AlertDialogPrimitive.Close.Props>) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
