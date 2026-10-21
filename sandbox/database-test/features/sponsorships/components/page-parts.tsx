import type { ReactNode } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { dueLabel, formatDate } from "../lib/format";
import { TONE_TEXT } from "../lib/tones";

export function PageIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-3">{children}</div>;
}

export function Stat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "danger";
}) {
  return (
    <Card>
      <CardHeader className="space-y-1 p-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle
          className={cn("text-2xl tabular-nums", tone === "danger" && "text-red-600 dark:text-red-400")}
        >
          {value}
        </CardTitle>
        {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
      </CardHeader>
    </Card>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  );
}

/** Date on top, relative "in 3 days" / "2 days overdue" underneath. */
export function DueDate({ date, now, soonDays }: { date: Date | null; now: Date; soonDays?: number }) {
  const due = dueLabel(date, now, soonDays);
  if (!date) return <span className="text-muted-foreground">{due.text}</span>;
  return (
    <div className="flex flex-col">
      <span className="whitespace-nowrap">{formatDate(date)}</span>
      <span className={cn("text-xs", TONE_TEXT[due.tone])}>{due.text}</span>
    </div>
  );
}
