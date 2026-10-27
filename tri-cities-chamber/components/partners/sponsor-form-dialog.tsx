"use client";

import { useState } from "react";
import { CircleDot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_SPONSOR_TODOS, SPONSOR_LEVELS, validateSponsorInput } from "@/lib/planner/sponsors";
import type { Sponsor, SponsorInput, SponsorLevel, SponsorStatus } from "@/lib/planner/types";

/** What the dialog is doing: adding a new sponsor, or editing an existing one. */
export type SponsorFormState = { mode: "create" } | { mode: "edit"; sponsor: Sponsor };

/** The information SponsorFormDialog needs. */
interface SponsorFormDialogProps {
  /** null keeps the dialog closed. */
  state: SponsorFormState | null;
  onClose: () => void;
  /** Called with the checked values; sponsorId is set when editing. Save makes a draft, Publish makes it active. */
  onSubmit: (input: SponsorInput, sponsorId?: string) => void;
}

/**
 * The "Sponsor Information" pop-up. The form inside is only created while the
 * pop-up is open, so it starts fresh each time.
 */
export function SponsorFormDialog({ state, onClose, onSubmit }: SponsorFormDialogProps) {
  return (
    <Dialog open={state !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        {state && (
          <SponsorForm
            key={state.mode === "edit" ? state.sponsor.id : "new"}
            state={state}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** The form: header with Save and Publish, contact details, additional details and the to do list. */
function SponsorForm({
  state,
  onClose,
  onSubmit,
}: {
  state: SponsorFormState;
  onClose: () => void;
  onSubmit: SponsorFormDialogProps["onSubmit"];
}) {
  const editing = state.mode === "edit" ? state.sponsor : null;
  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.contactEmail ?? "");
  const [phone, setPhone] = useState(editing?.contactPhone ?? "");
  const [website, setWebsite] = useState(editing?.website ?? "");
  const [level, setLevel] = useState<SponsorLevel | "">(editing?.level ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [todos, setTodos] = useState(editing?.todos ?? DEFAULT_SPONSOR_TODOS);
  const [error, setError] = useState("");

  /** Checks the values, then passes them up with the chosen status and closes the pop-up. */
  function submit(status: SponsorStatus) {
    const input: SponsorInput = {
      name: name.trim(),
      contactName: editing?.contactName,
      contactEmail: email.trim() || undefined,
      contactPhone: phone.trim() || undefined,
      website: website.trim() || undefined,
      level: level || undefined,
      notes: notes.trim() || undefined,
      status,
      todos,
    };
    const problem = validateSponsorInput(input);
    if (problem) return setError(problem);
    onSubmit(input, editing?.id);
    onClose();
  }

  /** Clears the error message when the person starts fixing the form. */
  function clearError() {
    setError("");
  }

  /** Ticks or unticks one to do line. */
  function toggleTodo(id: string, done: boolean) {
    setTodos((list) => list.map((t) => (t.id === id ? { ...t, done } : t)));
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit("draft");
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b p-6 pr-12">
        <div className="flex items-start gap-3">
          <CircleDot className="mt-1 h-8 w-8 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <DialogTitle className="text-2xl font-bold">Sponsor Information</DialogTitle>
            <DialogDescription>Enter sponsor details for the current project.</DialogDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="outline">
            Save
          </Button>
          <Button type="button" onClick={() => submit("active")}>
            Publish
          </Button>
        </div>
      </header>

      <div className="grid gap-6 p-6">
        <div className="grid gap-6 rounded-xl border p-5">
          <section className="grid gap-4" aria-labelledby="sp-contact">
            <h3 id="sp-contact" className="text-base font-semibold">
              Contact Details
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="sp-name">Sponsor Name</Label>
              <Input
                id="sp-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError();
                }}
                placeholder="e.g. Northstar Events"
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-email">Email Address</Label>
              <Input
                id="sp-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                placeholder="sponsor@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-phone">Phone Number</Label>
              <Input
                id="sp-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </section>

          <section className="grid gap-4" aria-labelledby="sp-additional">
            <h3 id="sp-additional" className="text-base font-semibold">
              Additional Details
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="sp-website">Company Website</Label>
              <Input
                id="sp-website"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  clearError();
                }}
                placeholder="https://www.sponsorcompany.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-level">Sponsorship Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as SponsorLevel)}>
                <SelectTrigger id="sp-level">
                  <SelectValue placeholder="Select level (e.g. Platinum, Gold, Silver)" />
                </SelectTrigger>
                <SelectContent>
                  {SPONSOR_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-notes">Notes</Label>
              <Textarea
                id="sp-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="bg-muted/50"
                placeholder="Add any specific requirements or instructions for the sponsor..."
              />
            </div>
          </section>

          <section className="grid gap-3" aria-labelledby="sp-todos">
            <h3 id="sp-todos" className="text-base font-semibold">
              To Do List
            </h3>
            <ul className="grid gap-2">
              {todos.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-lg bg-muted/60 px-4 py-3">
                  <Checkbox
                    id={`sp-todo-${t.id}`}
                    checked={t.done}
                    onCheckedChange={(v) => toggleTodo(t.id, v === true)}
                  />
                  <Label
                    htmlFor={`sp-todo-${t.id}`}
                    className={t.done ? "font-normal text-muted-foreground line-through" : "font-normal"}
                  >
                    {t.title}
                  </Label>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
