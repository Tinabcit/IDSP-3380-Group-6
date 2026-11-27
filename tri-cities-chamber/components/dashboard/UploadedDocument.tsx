"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatShortDate } from "@/lib/planner/dates";
import type { UploadedDoc } from "@/lib/planner/dashboard";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

const SAMPLE_PDF_URL = "/sample-contract.pdf";
export function UploadedDocument({ doc }: { doc: UploadedDoc }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{doc.fileName}</p>
        <p className="text-xs text-muted-foreground">
          Added {formatShortDate(doc.addedOn)} &bull; {doc.type}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-md border px-3 py-1 text-xs hover:bg-muted"
      >
        View
      </button>
      