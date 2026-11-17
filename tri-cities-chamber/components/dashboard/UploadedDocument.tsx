"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatShortDate } from "@/lib/planner/dates";
import type { UploadedDoc } from "@/lib/planner/dashboard";

// react-pdf only works in the browser, so it is loaded on demand with server rendering off.
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

/**
 * The PDF every preview shows for now. The app does not store the uploaded file itself, only its
 * name, so this is a placeholder. Swap it for the real file URL when file storage exists.
 */
const SAMPLE_PDF_URL = "/sample-contract.pdf";

/** One uploaded file: its name, type and date, with a View button that opens a PDF preview. */
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">{doc.fileName}</DialogTitle>
            <DialogDescription>Placeholder preview. The real file is not stored yet.</DialogDescription>
          </DialogHeader>
          {open && <PdfViewer url={SAMPLE_PDF_URL} />}
        </DialogContent>
      </Dialog>
    </li>
  );
}

/** The "Uploaded documents" card: a title with the file count, then one row per file. */
export function UploadedDocuments({ docs }: { docs: UploadedDoc[] }) {
  return (
    <section className="flex w-full flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-md font-bold">Uploaded documents</h2>
          <p className="text-xs text-muted-foreground">Contract files uploaded to the app.</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {docs.length} {docs.length === 1 ? "file" : "files"}
        </p>
      </header>
      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {docs.map((doc) => (
            <UploadedDocument key={doc.id} doc={doc} />
          ))}
        </ul>
      )}
    </section>
  );
}
