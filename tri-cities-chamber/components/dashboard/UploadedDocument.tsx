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
import "./UploadedDocument.css";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

const SAMPLE_PDF_URL = "/sample-contract.pdf";
export function UploadedDocument({ doc }: { doc: UploadedDoc }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="uploaded-document">
      <div className="uploaded-document__info">
        <p className="uploaded-document__name">{doc.fileName}</p>
        <p className="uploaded-document__meta">
          Added {formatShortDate(doc.addedOn)} &bull; {doc.type}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="uploaded-document__button"
      >
        View
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="uploaded-document__dialog">
          <DialogHeader>
            <DialogTitle className="uploaded-document__dialog-title">
              {doc.fileName}
            </DialogTitle>
            <DialogDescription>
              Placeholder preview. The real file is not stored yet.
            </DialogDescription>
          </DialogHeader>
          {open && <PdfViewer url={SAMPLE_PDF_URL} />}
        </DialogContent>
      </Dialog>
    </li>
  );
}

export function UploadedDocuments({ docs }: { docs: UploadedDoc[] }) {
  return (
    <section className="uploaded-documents">
      <header className="uploaded-documents__header">
        <div>
          <h2 className="uploaded-documents__title">Uploaded documents</h2>
          <p className="uploaded-documents__subtitle">
            Contract files uploaded to the app.
          </p>
        </div>
        <p className="uploaded-documents__count">
          {docs.length} {docs.length === 1 ? "file" : "files"}
        </p>
      </header>
      {docs.length === 0 ? (
        <p className="uploaded-documents__empty">No files uploaded yet.</p>
      ) : (
        <ul className="uploaded-documents__list">
          {docs.map((doc) => (
            <UploadedDocument key={doc.id} doc={doc} />
          ))}
        </ul>
      )}
    </section>
  );
}
