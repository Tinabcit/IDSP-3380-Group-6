
"use client";

import { useEffect, useState } from "react";
import { ClipboardList, X } from "lucide-react";

// Information for each task
export type TaskInfo = {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  event: string;
};

// Information received from the Home page
type TaskDetailsProps = {
  task: TaskInfo;
  onClose: () => void;
  onSave?: (task: TaskInfo) => void;
};

export default function TaskDetails({
  task,
  onClose,
  onSave,
}: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<TaskInfo>(task);

  // Load the selected task when it changes
  useEffect(() => {
    setEditedTask(task);
    setIsEditing(false);
  }, [task]);

  // Close the popup
  function handleClose() {
    setIsEditing(false);
    onClose();
  }

  // Close popup with Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsEditing(false);
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Update a task field
  function updateField(field: keyof TaskInfo, value: string) {
    setEditedTask((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // Start editing
  function handleEdit() {
    setIsEditing(true);
  }

  // Save task changes
  function handleSave() {
    if (!editedTask.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    onSave?.(editedTask);
    setIsEditing(false);
  }

  // Styles for light and dark mode
  const inputStyle =
    "w-full rounded-md border border-[#a7b4a0] " +
    "bg-[#eef2eb] px-3 py-2 text-sm text-gray-900 " +
    "outline-none focus:ring-2 focus:ring-[#0d7d8e] " +
    "disabled:cursor-default disabled:opacity-100 " +
    "dark:border-slate-600 dark:bg-slate-800 " +
    "dark:text-white dark:focus:ring-cyan-500 " +
    "dark:disabled:bg-slate-800 dark:disabled:text-slate-100 " +
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
                View the details of the selected task and its
                current status.
              </p>
            </div>
          </div>

          {/* Header Buttons */}
          <div className="flex items-center gap-2">

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-[#d3ddcc] bg-[#e7eee0] px-3 py-2 text-xs text-gray-900 hover:bg-[#dce6d5] dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              Close
            </button>

            {/* Edit / Save Button */}
            <button
              type="button"
              onClick={isEditing ? handleSave : handleEdit}
              className="rounded-md bg-[#0d7d8e] px-3 py-2 text-xs font-medium text-white hover:bg-[#096675] dark:bg-cyan-700 dark:hover:bg-cyan-600"
            >
              {isEditing ? "Save Task" : "Edit Task"}
            </button>

            {/* X Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close Task Details"
              className="ml-1 text-gray-500 hover:text-black dark:text-slate-400 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
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
              value={editedTask.title}
              onChange={(e) =>
                updateField("title", e.target.value)
              }
              disabled={!isEditing}
              className={inputStyle}
            />
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
              value={editedTask.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              disabled={!isEditing}
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
              value={editedTask.priority}
              onChange={(e) =>
                updateField("priority", e.target.value)
              }
              disabled={!isEditing}
              className={inputStyle}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
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
              value={editedTask.dueDate}
              onChange={(e) =>
                updateField("dueDate", e.target.value)
              }
              disabled={!isEditing}
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

            <input
              id="task-assigned"
              type="text"
              value={editedTask.assignedTo}
              onChange={(e) =>
                updateField("assignedTo", e.target.value)
              }
              disabled={!isEditing}
              className={inputStyle}
            />
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
              value={editedTask.event}
              onChange={(e) =>
                updateField("event", e.target.value)
              }
              disabled={!isEditing}
              className={inputStyle}
            >
              <option value={editedTask.event}>
                {editedTask.event || "No event selected"}
              </option>

              <option value="Business Excellence Gala">
                Business Excellence Gala
              </option>

              <option value="Digital Marketing Workshop">
                Digital Marketing Workshop
              </option>

              <option value="Small Business Summit">
                Small Business Summit
              </option>

              <option value="Networking Breakfast">
                Networking Breakfast
              </option>

              <option value="Municipal Policy Roundtable">
                Municipal Policy Roundtable
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
