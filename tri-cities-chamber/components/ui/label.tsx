import * as React from "react";

import { cn } from "@/lib/utils";

/** The text label for a form field. Connect it to a field with htmlFor and id. */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-70",
        className
      )}
      {...props}
    />
  );
}

export { Label };
