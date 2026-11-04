
"use client";

import { useState } from "react";

export default function TaskDetails() {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(
    "Prepare sponsor booth assets for launch day"
  );

  const [description, setDescription] = useState(
    "Gather the final sponsor logo files, review booth placement, and confirm the onboarding schedule with the sponsor team before launch day."
  );

  const [priority, setPriority] = useState("High");
  const [dueDate, setDueDate] = useState("2024-03-15");
  const [assignedTo, setAssignedTo] = useState("Ava Chen");
  const [event, setEvent] = useState("Spring Launch 2024");

  function handleEdit() {
    setIsEditing(true);
  }

  function handleSave() {
    setIsEditing(false);
  }

  function handleClose() {
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          View Task Details
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#202020] p-6">
      <div className="w-full max-w-6xl rounded-3xl bg-white p-7">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-100">
              <div className="h-2 w-2 rounded-full bg-black"></div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-black">
                Task Details
              </h1>
              <p className="mt-1 text-gray-500">
                View the details of the selected task and its current status.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="rounded border border-gray-300 px-3 py-2 text-black"
            >
              Close
            </button>

            <button
              onClick={isEditing ? handleSave : handleEdit}
              className="rounded bg-sky-600 px-3 py-2 text-white"
            >
              {isEditing ? "Save Task" : "Edit Task"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-black">
            Task Overview
          </h2>

          <div className="mb-5">
            <label className="mb-2 block font-semibold text-black">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-200 p-3 text-gray-600 disabled:bg-white"
            />
          </div>

          <div className="mb-7">
            <label className="mb-2 block font-semibold text-black">
              Task Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing}
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-black"
            />
          </div>

          <h2 className="mb-4 text-lg font-semibold text-black">
            Task Details
          </h2>

          <div className="mb-5">
            <label className="mb-2 block font-semibold text-black">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-gray-600"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="mb-2 block font-semibold text-black">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-gray-600"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block font-semibold text-black">
              Assigned To
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-200 p-3 text-gray-600 disabled:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-black">
              Event
            </label>
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-gray-600"
            >
              <option>Spring Launch 2024</option>
              <option>Business Networking Event</option>
              <option>Sponsor Appreciation Event</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
