"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/** Base UI parts accept a function as className; ours only take text so cn() can merge them. */
type WithClass<P> = Omit<P, "className"> & { className?: string };

/** The whole menu. */
const DropdownMenu = MenuPrimitive.Root;
/** The button that opens the menu (use `render` to show your own button). */
const DropdownMenuTrigger = MenuPrimitive.Trigger;
/** Groups radio items so only one can be picked. */
const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;

/** The floating box that holds the menu items. `align` and `sideOffset` place it next to the trigger. */
function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: WithClass<MenuPrimitive.Popup.Props> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="z-50 outline-none" align={align} sideOffset={sideOffset}>
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

/** One choice in the menu that shows a check mark when it is the picked one. */
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: WithClass<MenuPrimitive.RadioItem.Props>) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "relative flex cursor-default select-none items-center justify-between gap-6 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <MenuPrimitive.RadioItemIndicator>
        <Check className="h-4 w-4" aria-hidden />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
};
