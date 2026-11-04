import * as React from "react";

import { cn } from "@/lib/utils";

/** A bordered box on the card background. Add your own padding, or use the header/content/footer parts. */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-lg border bg-card text-card-foreground", className)}
      {...props}
    />
  );
}

/** The top of a card: holds the title and description. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

/** The card's heading. */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("font-semibold leading-none", className)} {...props} />;
}

/** Smaller grey text under the card's heading. */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

/** The main part of a card. */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-4 pt-0", className)} {...props} />;
}

/** The bottom of a card, usually for buttons. */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center p-4 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
