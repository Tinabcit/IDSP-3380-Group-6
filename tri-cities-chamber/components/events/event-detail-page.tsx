"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Pencil, Trash2, Users } from "lucide-react";

import { useTasksFilters } from "@/components/app-shell/app-sidebar";
import { usePlannerData } from "@/components/app-shell/planner-provider";
import { useToast } from "@/components/app-shell/toast-provider";
import { EventFormDialog, type EventFormState } from "@/components/events/event-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { amountPaid, formatCurrency } from "@/lib/planner/contracts";
import { describeRelativeDay, formatLongDate, isISODateBefore } from "@/lib/planner/dates";
import { summarizeEvent } from "@/lib/planner/event-detail";
import { categoryLabel, categoryOf, formatEventTime } from "@/lib/planner/events";
import type { EventInput } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

/**
 * The page for one event (/events/:id). It answers "how is this event going?":
 * when and where it is, the sponsorship money, each sponsor and their contract,
 * and the tasks still to do. Edit opens the same form used to add events.
 * If the id does not exist, it shows an "Event not found" message.
 */
export function EventDetailPage({ id }: { id: string }) {
  const data = usePlannerData();
  const toast = useToast();
  const router = useRouter();
  const filters = useTasksFilters();
  const [form, setForm] = useState<EventFormState | null>(null);
  const event = data.events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="mx-auto grid max-w-md gap-3 py-16 text-center">
        <h1 className="text-xl font-bold">Event not found</h1>
        <p className="text-sm text-muted-foreground">
          It may have been deleted. Go back to the list to find it.
        </p>
        <Button render={<Link href="/events" />} nativeButton={false} className="justify-self-center">
          All events
        </Button>
      </div>
    );
  }

  const { today } = data;
  const summary = summarizeEvent(event, data.contracts, data.tasks, data.sponsors, today);
  const isPast = isISODateBefore(event.endDate, today);

  /** Saves changes from the Edit pop-up. */
  function save(input: EventInput) {
    data.updateEvent(id, input);
    toast({ title: "Event updated", description: input.name, kind: "success" });
  }

  /** Deletes the event and goes back to the list. */
  function remove() {
    data.deleteEvent(id);
    toast({ title: "Event deleted", description: event?.name });
    router.push("/events");
  }

  /** Opens the Tasks page showing only this event's tasks. */
  function showAllTasks() {
    if (filters.eventId !== id) filters.pickEvent(id);
    router.push("/tasks");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button
          render={<Link href="/events" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="-ml-3 mb-1 text-muted-foreground"
        >
          <ArrowLeft />
          Events
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold leading-tight">{event.name}</h1>
              {event.isSignature && <Badge variant="signature">Signature event</Badge>}
              {isPast && <Badge variant="outline">Finished</Badge>}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <li className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden />
                {formatLongDate(event.startDate)}
                {event.endDate !== event.startDate && ` to ${formatLongDate(event.endDate)}`}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                {formatEventTime(event)}
              </li>
              {event.location && (
                <li className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {event.location}
                </li>
              )}
              {event.attendees !== undefined && (
                <li className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden />
                  {event.attendees} expected
                </li>
              )}
              <li>{categoryLabel(categoryOf(event))}</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setForm({ mode: "edit", event })}>
              <Pencil />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button type="button" variant="outline" aria-label={`Delete ${event.name}`} />}
              >
                <Trash2 />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {event.name} will be removed. Its contracts and tasks are kept, but they will no
                    longer be linked to an event.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep event</AlertDialogCancel>
                  <AlertDialogAction onClick={remove}>Delete event</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {event.description && <p className="mt-3 text-[15px]">{event.description}</p>}
      </div>

      <Card role="region" aria-labelledby="money-heading" className="grid gap-3 p-4">
        <h2 id="money-heading" className="text-base font-semibold">
          Sponsorship money
        </h2>
        {summary.contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contracts are linked to this event yet. When you upload a contract, choose this event
            and the money will show here.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-2xl font-bold">{formatCurrency(summary.total)}</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(summary.received)} paid so far ({summary.percent}%)
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Share of sponsorship paid"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={summary.percent}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full bg-done" style={{ width: `${summary.percent}%` }} />
            </div>
          </>
        )}
      </Card>

      <Card role="region" aria-labelledby="sponsors-heading" className="grid gap-3 p-4">
        <h2 id="sponsors-heading" className="text-base font-semibold">
          Sponsors ({summary.sponsors.length})
        </h2>
        {summary.sponsors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sponsors yet.</p>
        ) : (
          <ul className="grid divide-y">
            {summary.sponsors.map((line) => (
              <li key={line.contract?.id ?? line.name} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="font-medium">{line.name}</span>
                {line.contract ? (
                  <Link
                    href={`/contracts/${line.contract.id}`}
                    className="text-right underline-offset-2 hover:underline"
                  >
                    {formatCurrency(line.contract.amount)}
                    <span className="text-muted-foreground">
                      {" "}
                      ({formatCurrency(amountPaid(line.contract))} paid) - view contract
                    </span>
                  </Link>
                ) : (
                  <span className="text-muted-foreground">No contract yet</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card role="region" aria-labelledby="tasks-heading" className="grid gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="tasks-heading" className="text-base font-semibold">
            Tasks still to do ({summary.openTasks.length})
          </h2>
          {summary.overdue > 0 && (
            <Badge variant="overdue">{summary.overdue} overdue</Badge>
          )}
        </div>
        {summary.openTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing left to do for this event.</p>
        ) : (
          <ul className="grid divide-y">
            {summary.openTasks.map((task) => {
              const late = isISODateBefore(task.dueDate, today);
              return (
                <li key={task.id} className="flex items-center gap-3 py-2 text-sm">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={false}
                    onCheckedChange={() => {
                      data.toggleTask(task.id);
                      toast({ title: "Task done", description: task.title, kind: "success" });
                    }}
                    aria-label={`Mark "${task.title}" as done`}
                  />
                  <label htmlFor={`task-${task.id}`} className="min-w-0 flex-1 truncate">
                    {task.title}
                  </label>
                  <span className={cn("shrink-0", late ? "font-medium text-overdue" : "text-muted-foreground")}>
                    {late ? "Overdue - " : "Due "}
                    {describeRelativeDay(task.dueDate, today)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={showAllTasks}>
          See all tasks for this event
        </Button>
      </Card>

      <EventFormDialog state={form} onClose={() => setForm(null)} onSubmit={save} />
    </div>
  );
}
