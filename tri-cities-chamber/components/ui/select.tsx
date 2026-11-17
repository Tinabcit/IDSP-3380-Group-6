"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

/** Base UI parts accept a function as className; ours only take text so cn() can merge them. */
type WithClass<P> = Omit<P, "className"> & { className?: string };

/** One option's value and the text shown for it in the closed dropdown. */
export type SelectOption = { value: string; label: React.ReactNode };

type SelectProps = Omit<SelectPrimitive.Root.Props<string>, "onValueChange" | "items"> & {
  /** Called with the newly picked value (never called with "nothing picked"). */
  onValueChange?: (value: string) => void;
  /** The options' labels, so the closed dropdown shows "Alex" instead of the raw id. */
  items?: readonly SelectOption[] | Record<string, React.ReactNode>;
};

/** The whole dropdown. Use value, onValueChange and items (values must be text). */
function Select({ onValueChange, ...props }: SelectProps) {
  return (
    <SelectPrimitive.Root<string>
      onValueChange={(value) => {
        if (value !== null) onValueChange?.(value);
      }}
      {...props}
    />
  );
}

/** Groups related options together. */
const SelectGroup = SelectPrimitive.Group;

/** Shows the chosen option's label inside the button (or the placeholder when nothing is chosen). */
function SelectValue({ className, ...props }: WithClass<SelectPrimitive.Value.Props>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("line-clamp-1 text-left data-[placeholder]:text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The button that shows the current choice and opens the list. */
function SelectTrigger({ className, children, ...props }: WithClass<SelectPrimitive.Trigger.Props>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon render={<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />} />
    </SelectPrimitive.Trigger>
  );
}

/** Arrow at the top of a long list for scrolling up. */
function SelectScrollUpButton({ className, ...props }: WithClass<SelectPrimitive.ScrollUpArrow.Props>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn("top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1", className)}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

/** Arrow at the bottom of a long list for scrolling down. */
function SelectScrollDownButton({ className, ...props }: WithClass<SelectPrimitive.ScrollDownArrow.Props>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn("bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1", className)}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

/** The pop-up list of options. It opens under the button and is at least as wide as it. */
function SelectContent({ className, children, ...props }: WithClass<SelectPrimitive.Popup.Props>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner className="z-50 outline-none" sideOffset={4} alignItemWithTrigger={false}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative max-h-[var(--available-height)] min-w-[max(8rem,var(--anchor-width))] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          {children}
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

/** A heading inside a group (can't be selected). */
function SelectLabel({ className, ...props }: WithClass<SelectPrimitive.GroupLabel.Props>) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    />
  );
}

/** One option in the list. Needs a unique text `value`. */
function SelectItem({ className, children, ...props }: WithClass<SelectPrimitive.Item.Props>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/** A thin line between options. */
function SelectSeparator({ className, ...props }: WithClass<SelectPrimitive.Separator.Props>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
