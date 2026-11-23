"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// The worker must be set in this same file, and this file must only load in the browser.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/** Shows a PDF from a URL, one page at a time, with Previous / Next buttons. */
export default function PdfViewer({ url }: { url: string }) {
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="max-h-[60dvh] w-full overflow-auto rounded-md border bg-muted/30">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setPageCount(numPages)}
          loading={
            <p className="p-6 text-sm text-muted-foreground">Loading PDF...</p>
          }
          error={
            <p className="p-6 text-sm text-destructive">
              Could not load this PDF.
            </p>
          }
          className="flex justify-center"
        >
          <Page pageNumber={page} width={480} />
        </Document>
      </div>
      {pageCount > 0 && (
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border px-3 py-1 hover:bg-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            className="rounded-md border px-3 py-1 hover:bg-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
