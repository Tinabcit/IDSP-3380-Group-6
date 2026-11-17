
"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Pencil,
  X,
} from "lucide-react";

import { format, isValid, parseISO } from "date-fns";

import type { ProposedTask } from "@/lib/planner/proposed-tasks";
import { cn } from "@/lib/utils";

type ReviewTasksDialogProps = {
  open: boolean;
  tasks: ProposedTask[];
  onDone: (kept: ProposedTask[]) => void;
  onClose: () => void;
};

// Format the due date
function formatDate(value: string, pattern: string): string {
  const date = parseISO(value);
  return isValid(date) ? format(date, pattern) : value;
}

// Shared button styles
const ICON_BUTTON =
  "flex size-8 items-center justify-center rounded-md " +
  "border border-gray-300 bg-white text-gray-900 " +
  "hover:bg-gray-100 " +
  "dark:border-gray-600 dark:bg-gray-700 " +
  "dark:text-white dark:hover:bg-gray-600";

// Shared input styles
const INPUT_STYLE =
  "w-full rounded-md border border-gray-300 bg-white " +
  "px-3 py-2 text-sm text-gray-900 outline-none " +
  "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 " +
  "dark:border-gray-600 dark:bg-gray-800 " +
  "dark:text-white dark:focus:border-blue-400 " +
  "dark:focus:ring-blue-400 dark:[color-scheme:dark]";

export default function ReviewTasksDialog(
  props: ReviewTasksDialogProps
) {
  return props.open ? <DialogBody {...props} /> : null;
}

function DialogBody({
  tasks: initial,
  onDone,
  onClose,
}: ReviewTasksDialogProps) {
  const [tasks, setTasks] = useState<ProposedTask[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(
    null
  );
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Close using Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Sort tasks by due date
  const sorted = [...tasks].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );

  // Save or unsave a task
  function toggleSaved(id: string) {
    setSavedIds((ids) =>
      ids.includes(id)
        ? ids.filter((x) => x !== id)
        : [...ids, id]
    );
  }

  // Remove a task
  function dismiss(id: string) {
    setTasks((all) => all.filter((t) => t.id !== id));
    setSavedIds((ids) => ids.filter((x) => x !== id));
  }

  // Edit a task field
  function change(
    id: string,
    field: keyof ProposedTask,
    value: string
  ) {
    setTasks((all) =>
      all.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  }

  // Send saved tasks to the parent page
  function done() {
    onDone(sorted.filter((t) => savedIds.includes(t.id)));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
      {/* Main dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-tasks-title"
        className="flex max-h-[90vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="grid gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              TuDu / Tri-Cities Chamber
            </p>

            <div className="flex items-center gap-2.5">
              <h2
                id="review-tasks-title"
                className="text-2xl font-bold leading-8 text-gray-900 dark:text-white"
              >
                Review tasks
              </h2>

              <span className="flex h-[22px] items-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                {tasks.length}{" "}
                {tasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300">
              Choose which tasks to keep. Click a task
              title to expand its information.
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review tasks"
            className={cn(
              ICON_BUTTON,
              "shrink-0 text-[19px]"
            )}
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Task list */}
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="min-w-[760px]">
            {/* Table header */}
            <div className="flex h-9 items-center gap-4 bg-gray-100 px-6 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <p className="min-w-0 flex-1">
                Task title · click to expand
              </p>

              <p className="w-[220px] shrink-0">
                Event
              </p>

              <p className="w-[100px] shrink-0">
                Due date ↑
              </p>

              <p className="w-10 shrink-0 text-center">
                Save
              </p>

              <p className="w-10 shrink-0 text-center">
                Edit
              </p>

              <p className="w-12 shrink-0 text-center">
                Dismiss
              </p>
            </div>

            {/* Task rows */}
            {sorted.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                expanded={expandedId === task.id}
                editing={editingId === task.id}
                saved={savedIds.includes(task.id)}
                onToggle={() =>
                  setExpandedId(
                    expandedId === task.id ? null : task.id
                  )
                }
                onSave={() => toggleSaved(task.id)}
                onEdit={() => {
                  setEditingId(
                    editingId === task.id ? null : task.id
                  );
                  setExpandedId(task.id);
                }}
                onDismiss={() => dismiss(task.id)}
                onChange={(field, value) =>
                  change(task.id, field, value)
                }
              />
            ))}

            {tasks.length === 0 && (
              <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No tasks left to review.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-6 py-[18px] dark:border-gray-700">
          <div className="grid gap-1 text-xs">
            <p className="font-medium text-gray-900 dark:text-white">
              {tasks.length}{" "}
              {tasks.length === 1 ? "task" : "tasks"} to
              review
            </p>

            <p
              role="status"
              className="text-gray-500 dark:text-gray-400"
            >
              {savedIds.length} saved · only saved tasks
              are added to the calendar
            </p>
          </div>

          <button
            type="button"
            onClick={done}
            className="h-8 w-[84px] rounded-md bg-[#0088c9] text-xs font-medium text-white hover:bg-[#0079b3] dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Each task row and its expanded details
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
  onChange: (
    field: keyof ProposedTask,
    value: string
  ) => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* Task summary row */}
      <div className="flex h-[52px] items-center gap-4 bg-gray-100 px-6 dark:bg-gray-800">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-blue-700 hover:underline dark:text-blue-400",
            expanded ? "font-semibold" : "font-medium"
          )}
        >
          {expanded ? (
            <ChevronDown
              size={16}
              className="shrink-0"
              aria-hidden
            />
          ) : (
            <ChevronRight
              size={16}
              className="shrink-0"
              aria-hidden
            />
          )}

          <span className="truncate">
            {task.title}
          </span>
        </button>

        <p className="w-[220px] shrink-0 truncate text-xs text-gray-600 dark:text-gray-300">
          {task.eventName}
        </p>

        <p className="w-[100px] shrink-0 text-xs text-gray-600 dark:text-gray-300">
          {formatDate(task.dueDate, "MMM d, yyyy")}
        </p>

        {/* Save */}
        <div className="flex w-10 shrink-0 justify-center">
          <button
            type="button"
            onClick={onSave}
            aria-label={`${saved ? "Unsave" : "Save"} ${task.title}`}
            aria-pressed={saved}
            className={cn(
              ICON_BUTTON,
              saved &&
                "border-green-600 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-500 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
            )}
          >
            <Check size={16} aria-hidden />
          </button>
        </div>

        {/* Edit */}
        <div className="flex w-10 shrink-0 justify-center">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${task.title}`}
            className={ICON_BUTTON}
          >
            <Pencil size={16} aria-hidden />
          </button>
        </div>

        {/* Dismiss */}
        <div className="flex w-12 shrink-0 justify-center">
          <button
            type="button"
            onClick={onDismiss}
            aria-label={`Dismiss ${task.title}`}
            className={ICON_BUTTON}
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* Expanded Task Details */}
      {expanded && (
        <div className="bg-white pb-[22px] pl-12 pr-6 pt-5 text-gray-900 dark:bg-gray-900 dark:text-white">
          {editing ? (
            <div className="grid gap-3">
              {/* Task Title */}
              <Field
                label="Task title"
                value={task.title}
                onChange={(value) =>
                  onChange("title", value)
                }
              />

              {/* Task Description */}
              <label className="grid gap-1 text-xs text-gray-600 dark:text-gray-300">
                Task information

                <textarea
                  value={task.description}
                  onChange={(e) =>
                    onChange(
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                  className={`${INPUT_STYLE} resize-none`}
                />
              </label>

              {/* Sponsor, Event, Due Date */}
              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  label="Sponsor"
                  value={task.sponsorName}
                  onChange={(value) =>
                    onChange("sponsorName", value)
                  }
                />

                <Field
                  label="Event"
                  value={task.eventName}
                  onChange={(value) =>
                    onChange("eventName", value)
                  }
                />

                <Field
                  label="Due date"
                  type="date"
                  value={task.dueDate}
                  onChange={(value) =>
                    onChange("dueDate", value)
                  }
                />
              </div>

              {/* Done Editing */}
              <div>
                <button
                  type="button"
                  onClick={onEdit}
                  className="h-8 rounded-md bg-[#0088c9] px-3 text-xs font-medium text-white hover:bg-[#0079b3] dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Done editing
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-[18px]">
              {/* Task Information */}
              <div className="grid gap-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Task information
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {task.description}
                </p>
              </div>

              {/* Task Details */}
              <div className="grid gap-6 sm:grid-cols-3">
                <Detail
                  label="Sponsor"
                  value={task.sponsorName || "None"}
                />

                <Detail
                  label="Event"
                  value={task.eventName}
                />

                <Detail
                  label="Due date"
                  value={formatDate(
                    task.dueDate,
                    "MMMM d, yyyy"
                  )}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Details shown when the task is expanded
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

// Editable input field
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
    <label className="grid gap-1 text-xs text-gray-600 dark:text-gray-300">
      {label}

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`${INPUT_STYLE} h-9`}
      />
    </label>
  );
}
