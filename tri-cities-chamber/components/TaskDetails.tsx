
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
  }, [task.id]);

  // Update one field
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

  // Save changes
  function handleSave() {
    if (!editedTask.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    onSave?.(editedTask);
    setIsEditing(false);
  }

  // Close pop-up
  function handleClose() {
    setIsEditing(false);
    onClose();
  }

  // Close using Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
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
        className="w-full max-w-3xl rounded-2xl border border-[#d3ddcc] bg-[#f8faf5] p-5 shadow-xl sm:p-6"
      >
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#d3ddcc] pb-4">
          <div className="flex items-center gap-3">
            {/* Task icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d3ddcc] bg-[#eef2eb]">
              <ClipboardList
                size={24}
                className="text-[#292d68]"
              />
            </div>

            <div>
              <h1
                id="task-details-title"
                className="text-2xl font-bold text-[#252525]"
              >
                Task Details
              </h1>

              <p className="mt-1 text-xs text-gray-600">
                View the details of the selected task and its
                current status.
              </p>
            </div>
          </div>

          {/* Header buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-[#d3ddcc] bg-[#e7eee0] px-3 py-2 text-xs text-black hover:bg-[#dce6d5]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={isEditing ? handleSave : handleEdit}
              className="rounded-md bg-[#0d7d8e] px-3 py-2 text-xs text-white hover:bg-[#096675]"
            >
              {isEditing ? "Save Task" : "Edit Task"}
            </button>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close Task Details"
              className="ml-1 text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-[#d3ddcc] p-4 sm:p-5">

          {/* Task Overview */}
          <h2 className="mb-4 text-sm font-semibold text-[#252525]">
            Task Overview
          </h2>

          {/* Task Title */}
          <div className="mb-4">
            <label
              htmlFor="task-title"
              className="mb-1 block text-xs font-semibold text-black"
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
              className="w-full rounded-md border border-[#a7b4a0] bg-[#eef2eb] px-3 py-2 text-sm text-black disabled:opacity-100"
            />
          </div>

          {/* Task Description */}
          <div className="mb-5">
            <label
              htmlFor="task-description"
              className="mb-1 block text-xs font-semibold text-black"
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
              className="w-full resize-none rounded-lg border border-[#d3ddcc] bg-[#eef2eb] p-3 text-sm text-black disabled:opacity-100"
            />
          </div>

          {/* Task Details */}
          <h2 className="mb-4 text-sm font-semibold text-[#252525]">
            Task Details
          </h2>

          {/* Priority */}
          <div className="mb-4">
            <label
              htmlFor="task-priority"
              className="mb-1 block text-xs font-semibold text-black"
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
              className="w-full rounded-md border border-[#a7b4a0] bg-[#eef2eb] px-3 py-2 text-sm text-black"
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
              className="mb-1 block text-xs font-semibold text-black"
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
              className="w-full rounded-md border border-[#a7b4a0] bg-[#eef2eb] px-3 py-2 text-sm text-black"
            />
          </div>

          {/* Assigned To */}
          <div className="mb-4">
            <label
              htmlFor="task-assigned"
              className="mb-1 block text-xs font-semibold text-black"
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
              className="w-full rounded-md border border-[#a7b4a0] bg-[#eef2eb] px-3 py-2 text-sm text-black disabled:opacity-100"
            />
          </div>

          {/* Event */}
          <div>
            <label
              htmlFor="task-event"
              className="mb-1 block text-xs font-semibold text-black"
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
              className="w-full rounded-md border border-[#a7b4a0] bg-[#eef2eb] px-3 py-2 text-sm text-black"
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
