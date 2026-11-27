
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
  onSave: (task: TaskInfo) => Promise<void>;
};

export default function TaskDetails({
  task,
  onClose,
  onSave,
}: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<TaskInfo>(task);
  const [savedTask, setSavedTask] = useState<TaskInfo>(task);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Available events
  const eventOptions = [
    "Business Excellence Gala",
    "Digital Marketing Workshop",
    "Small Business Summit",
    "Networking Breakfast",
    "Municipal Policy Roundtable",
  ];

  // Load the selected task when it changes
  useEffect(() => {
    setEditedTask(task);
    setSavedTask(task);
    setIsEditing(false);
    setError("");
    setSuccess("");
  }, [task]);

  // Close the popup
  function handleClose() {
    if (isSaving) return;

    setIsEditing(false);
    onClose();
  }

  // Close popup with Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        setIsEditing(false);
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isSaving]);

  // Update a task field
  function updateField(field: keyof TaskInfo, value: string) {
    setEditedTask((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // Start editing
  function handleEdit() {
    setError("");
    setSuccess("");
    setIsEditing(true);
  }

  // Cancel editing and restore saved information
  function handleCancel() {
    if (isSaving) return;

    setEditedTask(savedTask);
    setIsEditing(false);
    setError("");
    setSuccess("");
  }

  // Save task changes
  async function handleSave() {
    if (isSaving) return;

    if (!editedTask.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const updatedTask = {
      ...editedTask,
      title: editedTask.title.trim(),
    };

    try {
      // Wait for the parent component to save the task
      await onSave(updatedTask);

      // Update the saved task information
      setEditedTask(updatedTask);
      setSavedTask(updatedTask);
      setIsEditing(false);
      setSuccess("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);

      setError("Failed to save task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Styles for light and dark mode
  const inputStyle =
    "w-full rounded-md border border-[#a7b4a0] " +
    "bg-[#eef2eb] px-3 py-2 text-sm text-gray-900 " +
    "outline-none focus:ring-2 focus:ring-[#0d7d8e] " +
    "disabled:cursor-default disabled:opacity-100 " +
    "dark:border-slate-600 dark:bg-slate-800 " +
    "dark:text-white dark:focus:ring-cyan-500 " +
    "dark:disabled:bg-slate-800 " +
    "dark:disabled:text-slate-100 " +
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
        aria-busy={isSaving}
        className="w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl border border-[#d3ddcc] bg-[#f8faf5] p-5 text-gray-900 shadow-xl sm:p-6 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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

            {/* Header Title */}
            <div>
              <h1
                id="task-details-title"
                className="text-2xl font-bold text-[#252525] dark:text-white"
              >
                Task Details
              </h1>

              <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">
                {isEditing
                  ? "Edit the information for the selected task."
                  : "View the details of the selected task and its current status."}
              </p>
            </div>
          </div>

          {/* Header Buttons */}
          <div className="flex items-center gap-2">

            {/* Close / Cancel Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={isEditing ? handleCancel : handleClose}
              className="rounded-md border border-[#d3ddcc] bg-[#e7eee0] px-3 py-2 text-xs text-gray-900 hover:bg-[#dce6d5] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              {isEditing ? "Cancel" : "Close"}
            </button>

            {/* Edit / Save Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={isEditing ? handleSave : handleEdit}
              className="rounded-md bg-[#0d7d8e] px-3 py-2 text-xs font-medium text-white hover:bg-[#096675] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-700 dark:hover:bg-cyan-600"
            >
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Edit Task"}
            </button>

            {/* X Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleClose}
              aria-label="Close Task Details"
              className="ml-1 text-gray-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div
            role="status"
            className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
          >
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </div>
        )}

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
              disabled={!isEditing || isSaving}
              className={inputStyle}
              placeholder="Enter task title"
              required
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
              disabled={!isEditing || isSaving}
              rows={4}
              className={`${inputStyle} resize-none`}
              placeholder="Enter task description"
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
              disabled={!isEditing || isSaving}
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
              disabled={!isEditing || isSaving}
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
              disabled={!isEditing || isSaving}
              className={inputStyle}
              placeholder="Enter assigned person"
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
              disabled={!isEditing || isSaving}
              className={inputStyle}
            >
              <option value="">
                No event selected
              </option>

              {/* Keep existing event if not in the list */}
              {editedTask.event &&
                !eventOptions.includes(editedTask.event) && (
                  <option value={editedTask.event}>
                    {editedTask.event}
                  </option>
                )}

              {/* Display available events */}
              {eventOptions.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
