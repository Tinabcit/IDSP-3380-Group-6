"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardList } from "lucide-react";

import { taskInputFrom } from "@/lib/planner/tasks";
import type {
  ChamberEvent,
  StaffMember,
  Task,
  TaskInput,
  TaskPriority,
} from "@/lib/planner/types";

/** The priority choices shown in the dropdown. */
const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Information received from the page that opens the popup
type TaskDetailsProps = {
  task: Task;
  events: ChamberEvent[];
  staff: StaffMember[];
  onClose: () => void;
  onSave: (input: TaskInput) => void;
};

/**
 * Popup that shows a task with every field ready to edit. Dropdowns and the
 * date save as soon as they change; text boxes save when you click out of
 * them or close the popup. A task is never saved without a title or due date.
 */
export default function TaskDetails({
  task,
  events,
  staff,
  onClose,
  onSave,
}: TaskDetailsProps) {
  // The parent gives this popup a key per task, so it starts fresh for each one.
  const [draft, setDraft] = useState<Task>(task);
  const lastSaved = useRef<Task>(task);

  // Save the task if it changed and has the required fields.
  function save(next: Task) {
    if (!next.title.trim() || !next.dueDate) return;

    const input = taskInputFrom(next);
    if (
      JSON.stringify(input) === JSON.stringify(taskInputFrom(lastSaved.current))
    ) {
      return;
    }

    onSave(input);
    lastSaved.current = next;
  }

  // Change one field. Pass saveNow for dropdowns and the date picker.
  function updateField<K extends keyof Task>(
    field: K,
    value: Task[K],
    saveNow = false
  ) {
    const next = { ...draft, [field]: value };
    setDraft(next);
    if (saveNow) save(next);
  }

  // Save anything still unsaved, then close the popup
  function handleClose() {
    save(draft);
    onClose();
  }

  // Keep the latest close handler for the Escape key listener below
  const closeRef = useRef(handleClose);
  useEffect(() => {
    closeRef.current = handleClose;
  });

  // Close popup with Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Styles for light and dark mode
  const inputStyle =
    "w-full rounded-md border border-[#a7b4a0] " +
    "bg-[#eef2eb] px-3 py-2 text-sm text-gray-900 " +
    "outline-none focus:ring-2 focus:ring-[#0d7d8e] " +
    "dark:border-slate-600 dark:bg-slate-800 " +
    "dark:text-white dark:focus:ring-cyan-500 " +
    "dark:[color-scheme:dark]";

  const labelStyle =
    "mb-1 block text-xs font-semibold text-gray-900 " +
    "dark:text-slate-200";

  const headingStyle =
    "mb-4 text-sm font-semibold text-[#252525] " +
    "dark:text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 dark:bg-black/70"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Task Details Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
        className="w-full max-w-3xl rounded-2xl border border-[#d3ddcc] bg-[#f8faf5] p-5 text-gray-900 shadow-xl sm:p-6 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#d3ddcc] pb-4 dark:border-slate-700">
          <div className="flex items-center gap-3">

            {/* Task Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d3ddcc] bg-[#eef2eb] dark:border-slate-600 dark:bg-slate-800">
              <ClipboardList
                size={24}
                className="text-[#292d68] dark:text-cyan-400"
              />
            </div>

            <div>
              <h1
                id="task-details-title"
                className="text-2xl font-bold text-[#252525] dark:text-white"
              >
                Task Details
              </h1>

              <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">
                Click any field to edit it. Changes save
                automatically.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-[#d3ddcc] bg-[#e7eee0] px-3 py-2 text-xs text-gray-900 hover:bg-[#dce6d5] dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
          >
            Close
          </button>
        </div>

        {/* Main Content */}
        <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-[#d3ddcc] bg-[#f8faf5] p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800">

          {/* Task Overview */}
          <h2 className={headingStyle}>
            Task Overview
          </h2>

          {/* Task Title */}
          <div className="mb-4">
            <label
              htmlFor="task-title"
              className={labelStyle}
            >
              Task Title
            </label>

            <input
              id="task-title"
              type="text"
              value={draft.title}
              onChange={(e) => updateField("title", e.target.value)}
              onBlur={() => save(draft)}
              aria-invalid={!draft.title.trim()}
              className={inputStyle}
            />

            {!draft.title.trim() && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                A task needs a title. This change will not be saved until you
                add one.
              </p>
            )}
          </div>

          {/* Task Description */}
          <div className="mb-5">
            <label
              htmlFor="task-description"
              className={labelStyle}
            >
              Task Description
            </label>

            <textarea
              id="task-description"
              value={draft.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value)}
              onBlur={() => save(draft)}
              rows={4}
              className={`${inputStyle} resize-none`}
            />
          </div>

          {/* Task Details Section */}
          <h2 className={headingStyle}>
            Task Details
          </h2>

          {/* Priority */}
          <div className="mb-4">
            <label
              htmlFor="task-priority"
              className={labelStyle}
            >
              Priority
            </label>

            <select
              id="task-priority"
              value={draft.priority ?? ""}
              onChange={(e) =>
                updateField(
                  "priority",
                  (e.target.value || undefined) as TaskPriority | undefined,
                  true
                )
              }
              className={inputStyle}
            >
              <option value="">Not set</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label
              htmlFor="task-date"
              className={labelStyle}
            >
              Due Date
            </label>

            <input
              id="task-date"
              type="date"
              value={draft.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value, true)}
              className={inputStyle}
            />
          </div>

          {/* Assigned To */}
          <div className="mb-4">
            <label
              htmlFor="task-assigned"
              className={labelStyle}
            >
              Assigned To
            </label>

            <select
              id="task-assigned"
              value={draft.assigneeId}
              onChange={(e) => updateField("assigneeId", e.target.value, true)}
              className={inputStyle}
            >
              {staff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event */}
          <div>
            <label
              htmlFor="task-event"
              className={labelStyle}
            >
              Event
            </label>

            <select
              id="task-event"
              value={draft.eventId ?? ""}
              onChange={(e) =>
                updateField("eventId", e.target.value || undefined, true)
              }
              className={inputStyle}
            >
              <option value="">No event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
