
"use client";

import { useState } from "react";
import ReviewTasksDialog from "@/components/review-tasks-dialog/review-tasks-dialog";

export default function ReviewTasksPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#e5eddf] p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#29285f]">
        Dialogs & forms
      </h1>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-[#168a91] px-5 py-2 text-white"
      >
        Review Tasks
      </button>

      <ReviewTasksDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
