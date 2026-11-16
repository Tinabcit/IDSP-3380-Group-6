"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronRight, Pencil, X } from "lucide-react";

import { format, isValid, parseISO } from "date-fns";

import type { ProposedTask } from "@/lib/planner/proposed-tasks";
import { cn } from "@/lib/utils";

type ReviewTasksDialogProps = {
  open: boolean;
  /** The tasks the document reader suggested. */
  tasks: ProposedTask[];
  /** Called with the tasks the user saved when they press Done. */
  onDone: (kept: ProposedTask[]) => void;
  /** Called when the dialog is closed with the X or Escape (nothing is kept). */
  onClose: () => void;
};

/** Formats a yyyy-MM-dd date with date-fns pattern `pattern`; shows the raw text if it is not a real date (e.g. while editing). */
function formatDate(value: string, pattern: string): string {
  const date = parseISO(value);
  return isValid(date) ? format(date, pattern) : value;
}

/** Row icon button shared by Save, Edit and Dismiss. */
const ICON_BUTTON =
  "flex size-8 items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5]";

/**
 * The Review tasks dialog (Figma "Review tasks dialog"). Shows the tasks read
 * from an uploaded document, sorted by due date. Click a title to expand it,
 * tick (save) the ones to keep, edit one in place, or dismiss it. Done hands
 * the saved tasks back to the page.
 */
export default function ReviewTasksDialog(props: ReviewTasksDialogProps) {
  // The inner part only exists while open, so its state starts fresh each time.
  return props.open ? <DialogBody {...props} /> : null;
}

/** The open dialog and its state: the task list, which row is expanded or edited, and which are saved. */
function DialogBody({ tasks: initial, onDone, onClose }: ReviewTasksDialogProps) {
  const [tasks, setTasks] = useState<ProposedTask[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Escape closes the dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sorted = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  /** Ticks or unticks a task as one to keep. */
  function toggleSaved(id: string) {
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  /** Removes a task from the list for good. */
  function dismiss(id: string) {
    setTasks((all) => all.filter((t) => t.id !== id));
    setSavedIds((ids) => ids.filter((x) => x !== id));
  }

  /** Changes one field of a task while it is being edited. */
  function change(id: string, field: keyof ProposedTask, value: string) {
    setTasks((all) => all.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  /** Hands the saved tasks back to the page. */
  function done() {
    onDone(sorted.filter((t) => savedIds.includes(t.id)));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-tasks-title"
        className="flex max-h-[90vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-[10px] border border-[rgba(229,231,235,0.38)] bg-white text-[#0a0a0a] shadow-[0_16px_56px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-start justify-between gap-4 p-6">
          <div className="grid gap-2">
            <p className="text-xs text-[#737373]">TuDu / Tri-Cities Chamber</p>
            <div className="flex items-center gap-2.5">
              <h2 id="review-tasks-title" className="text-2xl font-bold leading-8">
                Review tasks
              </h2>
              <span className="flex h-[22px] items-center rounded-full bg-[#f4f4f5] px-2 text-xs font-medium text-[#737373]">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            <p className="text-sm">Choose which tasks to keep. Click a task title to expand its information.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close review tasks" className={cn(ICON_BUTTON, "shrink-0 text-[19px]")}>
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="min-w-[760px]">
            <div className="flex h-9 items-center gap-4 bg-[#f5f5f5] px-6 text-xs font-medium">
              <p className="min-w-0 flex-1">Task title · click to expand</p>
              <p className="w-[220px] shrink-0 text-[#737373]">Event</p>
              <p className="w-[100px] shrink-0 text-[#737373]">Due date ↑</p>
              <p className="w-10 shrink-0 text-center text-[#737373]">Save</p>
              <p className="w-10 shrink-0 text-center text-[#737373]">Edit</p>
              <p className="w-12 shrink-0 text-center text-[#737373]">Dismiss</p>
            </div>

            {sorted.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                expanded={expandedId === task.id}
                editing={editingId === task.id}
                saved={savedIds.includes(task.id)}
                onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
                onSave={() => toggleSaved(task.id)}
                onEdit={() => {
                  setEditingId(editingId === task.id ? null : task.id);
                  setExpandedId(task.id);
                }}
                onDismiss={() => dismiss(task.id)}
                onChange={(field, value) => change(task.id, field, value)}
              />
            ))}

            {tasks.length === 0 && <p className="p-8 text-center text-sm text-[#737373]">No tasks left to review.</p>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-[18px]">
          <div className="grid gap-1 text-xs">
            <p className="font-medium">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} to review
            </p>
            <p role="status" className="text-[#737373]">
              {savedIds.length} saved · only saved tasks are added to the calendar
            </p>
          </div>
          <button
            type="button"
            onClick={done}
            className="h-7 w-[84px] rounded-md bg-[#0088c9] text-xs font-medium text-[#ebfcff] hover:bg-[#0079b3]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/** One task: its summary line, and below it the details (or the edit form) when expanded. */
function TaskRow({
  task,
  expanded,
  editing,
  saved,
  onToggle,
  onSave,
  onEdit,
  onDismiss,
  onChange,
}: {
  task: ProposedTask;
  expanded: boolean;
  editing: boolean;
  saved: boolean;
  onToggle: () => void;
  onSave: () => void;
  onEdit: () => void;
  onDismiss: () => void;
  onChange: (field: keyof ProposedTask, value: string) => void;
}) {
  return (
    <div className="border-b border-[rgba(229,231,235,0.38)]">
      <div className="flex h-[52px] items-center gap-4 bg-[#f3f4f6] px-6">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-[#1764e8] hover:underline",
            expanded ? "font-semibold" : "font-medium"
          )}
        >
          {expanded ? <ChevronDown size={16} className="shrink-0" aria-hidden /> : <ChevronRight size={16} className="shrink-0" aria-hidden />}
          <span className="truncate">{task.title}</span>
        </button>
        <p className="w-[220px] shrink-0 truncate text-xs text-[#737373]">{task.eventName}</p>
        <p className="w-[100px] shrink-0 text-xs text-[#737373]">{formatDate(task.dueDate, "MMM d, yyyy")}</p>
        <div className="flex w-10 shrink-0 justify-center">
          <button
            type="button"
            onClick={onSave}
            aria-label={`${saved ? "Unsave" : "Save"} ${task.title}`}
            aria-pressed={saved}
            className={cn(ICON_BUTTON, saved && "border-green-600 bg-green-50 text-green-700 hover:bg-green-100")}
          >
            <Check size={16} aria-hidden />
          </button>
        </div>
        <div className="flex w-10 shrink-0 justify-center">
          <button type="button" onClick={onEdit} aria-label={`Edit ${task.title}`} className={ICON_BUTTON}>
            <Pencil size={16} aria-hidden />
          </button>
        </div>
        <div className="flex w-12 shrink-0 justify-center">
          <button type="button" onClick={onDismiss} aria-label={`Dismiss ${task.title}`} className={ICON_BUTTON}>
            <X size={16} aria-hidden />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-white pb-[22px] pl-12 pr-6 pt-5">
          {editing ? (
            <div className="grid gap-3">
              <Field label="Task title" value={task.title} onChange={(v) => onChange("title", v)} />
              <label className="grid gap-1 text-xs text-[#737373]">
                Task information
                <textarea
                  value={task.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  rows={3}
                  className="rounded-md border border-[#e5e5e5] p-2 text-sm text-[#0a0a0a]"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Sponsor" value={task.sponsorName} onChange={(v) => onChange("sponsorName", v)} />
                <Field label="Event" value={task.eventName} onChange={(v) => onChange("eventName", v)} />
                <Field label="Due date" type="date" value={task.dueDate} onChange={(v) => onChange("dueDate", v)} />
              </div>
              <div>
                <button type="button" onClick={onEdit} className="h-7 rounded-md bg-[#0088c9] px-3 text-xs font-medium text-[#ebfcff]">
                  Done editing
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-[18px]">
              <div className="grid gap-1.5">
                <p className="text-xs font-medium text-[#737373]">Task information</p>
                <p className="text-sm text-[#737373]">{task.description}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <Detail label="Sponsor" value={task.sponsorName || "None"} />
                <Detail label="Event" value={task.eventName} />
                <Detail label="Due date" value={formatDate(task.dueDate, "MMMM d, yyyy")} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** A small grey label over a value, used in the expanded details. */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <p className="text-xs text-[#737373]">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

/** A labelled text (or date) box used in the edit form. */
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-xs text-[#737373]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-[#e5e5e5] px-2 text-sm text-[#0a0a0a]"
      />
    </label>
  );
}
