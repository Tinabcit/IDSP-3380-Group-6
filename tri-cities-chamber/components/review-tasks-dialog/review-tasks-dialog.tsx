
"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Pencil, X } from "lucide-react";

type Task = {
  id: number;
  title: string;
  event: string;
  dueDate: string;
  description: string;
  sponsor: string;
};

type ReviewTasksDialogProps = {
  open: boolean;
  onClose: () => void;
};

const sampleTasks: Task[] = [
  {
    id: 1,
    title: "Optimize images",
    event: "Website Redesign",
    dueDate: "2024-10-05",
    description: "Optimize website images to improve loading speed.",
    sponsor: "N/A",
  },
  {
    id: 2,
    title: "Integrate CMS",
    event: "Website Redesign",
    dueDate: "2024-10-06",
    description: "Connect the content management system to the website.",
    sponsor: "N/A",
  },
  {
    id: 3,
    title: "Implement user authentication",
    event: "Website Redesign",
    dueDate: "2024-10-07",
    description: "Add user login and authentication.",
    sponsor: "N/A",
  },
  {
    id: 4,
    title: "Create app wireframes",
    event: "Mobile App Development",
    dueDate: "2024-10-09",
    description: "Create wireframes for the mobile application.",
    sponsor: "N/A",
  },
  {
    id: 5,
    title: "Design UI components",
    event: "Mobile App Development",
    dueDate: "2024-10-10",
    description: "Design reusable components for the application.",
    sponsor: "N/A",
  },
  {
    id: 6,
    title: "Six Complimentary Tickets",
    event: "Business Excellence Awards",
    dueDate: "2024-10-11",
    description:
      "Allocate six complimentary tickets to RBC for the Business Excellence Awards. Confirm guest names and requirements, then send the registration details to the sponsor contact.",
    sponsor: "RBC",
  },
  {
    id: 7,
    title: "Four Complimentary Tickets",
    event: "Business Excellence Awards",
    dueDate: "2024-10-12",
    description: "Arrange four complimentary tickets for the event.",
    sponsor: "N/A",
  },
  {
    id: 8,
    title: "Sponsorship Funding 2026",
    event: "Mayor's BBQ",
    dueDate: "2024-10-13",
    description: "Review sponsorship funding details for 2026.",
    sponsor: "N/A",
  },
  {
    id: 9,
    title: "Comp Tickets 6/6",
    event: "Mayor's BBQ",
    dueDate: "2024-10-14",
    description: "Confirm six complimentary tickets for the event.",
    sponsor: "N/A",
  },
];

export default function ReviewTasksDialog({
  open,
  onClose,
}: ReviewTasksDialogProps) {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [expandedTask, setExpandedTask] = useState<number | null>(6);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [savedTasks, setSavedTasks] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  function toggleTask(id: number) {
    setExpandedTask(expandedTask === id ? null : id);
  }

  function saveTask(id: number) {
    if (!savedTasks.includes(id)) {
      setSavedTasks([...savedTasks, id]);
    }
    setMessage("Task saved successfully.");
  }

  function dismissTask(id: number) {
    setTasks(tasks.filter((task) => task.id !== id));
    setMessage("Task dismissed.");
  }

  function updateTask(id: number, field: keyof Task, value: string) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  }

  function formatDate(date: string) {
    return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-tasks-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#d0d8c8] bg-[#f8faf5] shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5">
          <div>
            <p className="mb-2 text-xs text-gray-500">
              TuDu / Tri-Cities Chamber
            </p>

            <div className="flex items-center gap-3">
              <h2
                id="review-tasks-title"
                className="text-2xl font-bold text-gray-900"
              >
                Review tasks
              </h2>

              <span className="rounded-full bg-[#e4ebdc] px-3 py-1 text-xs text-gray-600">
                {tasks.length} tasks
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-700">
              Choose which tasks to keep. Click a task title to expand its
              information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review tasks"
            className="rounded-md border border-[#cbd5c2] p-2 hover:bg-[#e4ebdc]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Task table */}
        <div className="overflow-auto">
          <table className="w-full min-w-lg border-collapse text-left text-sm">
            <thead className="bg-[#e3eadb] text-xs text-gray-700">
              <tr>
                <th className="px-5 py-3 font-medium">
                  Task title · click to expand
                </th>
                <th className="px-3 py-3 font-medium">Event</th>
                <th className="px-3 py-3 font-medium">Due date ↑</th>
                <th className="px-3 py-3 text-center font-medium">Save</th>
                <th className="px-3 py-3 text-center font-medium">Edit</th>
                <th className="px-3 py-3 text-center font-medium">Dismiss</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <FragmentRow
                  key={task.id}
                  task={task}
                  expanded={expandedTask === task.id}
                  editing={editingTask === task.id}
                  saved={savedTasks.includes(task.id)}
                  onToggle={() => toggleTask(task.id)}
                  onSave={() => saveTask(task.id)}
                  onEdit={() => {
                    setEditingTask(
                      editingTask === task.id ? null : task.id
                    );
                    setExpandedTask(task.id);
                  }}
                  onDismiss={() => dismissTask(task.id)}
                  onChange={(field, value) =>
                    updateTask(task.id, field, value)
                  }
                  formatDate={formatDate}
                />
              ))}
            </tbody>
          </table>

          {tasks.length === 0 && (
            <p className="p-8 text-center text-sm text-gray-500">
              No tasks left to review.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#d4dccd] p-5">
          <div>
            <p className="text-xs font-medium text-gray-800">
              {tasks.length} tasks to review
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Sample tasks · Original October 2024 due dates
            </p>
            {message && (
              <p role="status" className="mt-1 text-xs text-teal-700">
                {message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#168a91] px-8 py-2 text-sm font-medium text-white hover:bg-[#116e74]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

type RowProps = {
  task: Task;
  expanded: boolean;
  editing: boolean;
  saved: boolean;
  onToggle: () => void;
  onSave: () => void;
  onEdit: () => void;
  onDismiss: () => void;
  onChange: (field: keyof Task, value: string) => void;
  formatDate: (date: string) => string;
};

function FragmentRow({
  task,
  expanded,
  editing,
  saved,
  onToggle,
  onSave,
  onEdit,
  onDismiss,
  onChange,
  formatDate,
}: RowProps) {
  return (
    <>
      <tr className="border-b border-[#d4dccd] bg-[#f0f4ec]">
        <td className="px-5 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="flex items-center gap-2 text-left font-medium text-[#29285f] hover:underline"
          >
            {expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            {task.title}
          </button>
        </td>

        <td className="px-3 py-3 text-xs text-gray-600">
          {task.event}
        </td>

        <td className="px-3 py-3 text-xs text-gray-600">
          {formatDate(task.dueDate)}
        </td>

        <td className="px-3 py-3 text-center">
          <button
            type="button"
            onClick={onSave}
            aria-label={`Save ${task.title}`}
            className={`rounded-md border p-2 ${
              saved
                ? "border-teal-500 bg-teal-100 text-teal-700"
                : "border-[#cbd5c2] bg-[#e4ebdc] text-gray-800"
            }`}
          >
            <Check size={16} />
          </button>
        </td>

        <td className="px-3 py-3 text-center">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${task.title}`}
            className="rounded-md border border-[#cbd5c2] bg-[#e4ebdc] p-2"
          >
            <Pencil size={16} />
          </button>
        </td>

        <td className="px-3 py-3 text-center">
          <button
            type="button"
            onClick={onDismiss}
            aria-label={`Dismiss ${task.title}`}
            className="rounded-md border border-[#cbd5c2] bg-[#e4ebdc] p-2"
          >
            <X size={16} />
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#f8faf5]">
          <td colSpan={6} className="px-10 py-5">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs">Task title</label>
                  <input
                    value={task.title}
                    onChange={(e) =>
                      onChange("title", e.target.value)
                    }
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs">Description</label>
                  <textarea
                    value={task.description}
                    onChange={(e) =>
                      onChange("description", e.target.value)
                    }
                    className="w-full rounded border p-2 text-sm"
                    rows={3}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs">Sponsor</label>
                    <input
                      value={task.sponsor}
                      onChange={(e) =>
                        onChange("sponsor", e.target.value)
                      }
                      className="w-full rounded border p-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs">Event</label>
                    <input
                      value={task.event}
                      onChange={(e) =>
                        onChange("event", e.target.value)
                      }
                      className="w-full rounded border p-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs">Due date</label>
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) =>
                        onChange("dueDate", e.target.value)
                      }
                      className="w-full rounded border p-2 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded bg-[#168a91] px-4 py-2 text-xs text-white"
                >
                  Done editing
                </button>
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs text-gray-600">
                  Task information
                </p>

                <p className="mb-4 text-sm text-gray-600">
                  {task.description}
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-500">Sponsor</p>
                    <p className="mt-1 text-sm font-medium">
                      {task.sponsor}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Event</p>
                    <p className="mt-1 text-sm font-medium">
                      {task.event}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Due date</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
