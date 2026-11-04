"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Base UI parts accept a function as className; ours only take text so cn() can merge them. */
type WithClass<P> = Omit<P, "className"> & { className?: string };

/** The whole pop-up window. Open or close it with the open / onOpenChange props. */
const Dialog = DialogPrimitive.Root;
/** The thing you click to open the pop-up (use `render` to show your own button). */
const DialogTrigger = DialogPrimitive.Trigger;
/** Draws the pop-up on top of the page, outside its normal place in the HTML. */
const DialogPortal = DialogPrimitive.Portal;
/** The thing you click to close the pop-up. */
const DialogClose = DialogPrimitive.Close;

/** The dark layer behind the pop-up. */
function DialogOverlay({ className, ...props }: WithClass<DialogPrimitive.Backdrop.Props>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

/** The pop-up box (has a close X built in). Put the header, footer and form inside it. */
function DialogContent({
  className,
  children,
  ...props
}: WithClass<DialogPrimitive.Popup.Props>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          // Bottom sheet on phones, centred dialog from sm up.
          "fixed inset-x-0 bottom-0 z-50 grid max-h-[92dvh] w-full gap-4 overflow-y-auto rounded-t-xl border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg duration-200 outline-none data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:slide-out-to-bottom data-[open]:slide-in-from-bottom",
          "sm:inset-x-auto sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:p-6 sm:data-[closed]:slide-out-to-bottom-0 sm:data-[open]:slide-in-from-bottom-0 sm:data-[closed]:zoom-out-95 sm:data-[open]:zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

/** Holds the title and description. */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col space-y-1.5 text-left", className)}
      {...props}
    />
  );
}

/** Holds the buttons at the bottom. */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

/** The pop-up's heading (screen readers read it out). */
function DialogTitle({ className, ...props }: WithClass<DialogPrimitive.Title.Props>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

/** The explanation text under the heading. */
function DialogDescription({ className, ...props }: WithClass<DialogPrimitive.Description.Props>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
