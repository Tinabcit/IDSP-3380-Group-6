"use client";

import { useEffect, useReducer, useRef } from "react";
import { CheckCircle2, FileText, Loader2, Plus, RefreshCw, Upload, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  checkFile,
  formatFileSize,
  idleUpload,
  uploadReducer,
  type UploadState,
} from "@/lib/planner/upload";
import { cn } from "@/lib/utils";

/**
 * The PDF upload card. There is no server, so progress is faked with a timer.
 * Shows the idle box, a spinner with the percent, a green check when done, or
 * a red "Upload failed" chip with retry, cancel and re-add buttons.
 * Tells the page when a file finishes (onComplete) or is removed (onClear).
 */
export function UploadCard({
  onComplete,
  onClear,
}: {
  onComplete: (fileName: string) => void;
  onClear: () => void;
}) {
  const [state, dispatch] = useReducer(uploadReducer, idleUpload);
  const inputRef = useRef<HTMLInputElement>(null);
  const failNext = useRef(false);

  const uploading = state.status === "uploading";
  const fileName = state.status === "idle" ? "" : state.fileName;

  // While uploading, bump the percent every 150ms and finish at 100.
  useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(() => {
      dispatch({ type: "progress", percent: (state as { percent: number }).percent + 12 });
    }, 150);
    return () => clearInterval(timer);
  }, [uploading, state]);

  useEffect(() => {
    if (state.status === "uploading" && state.percent >= 100) {
      if (failNext.current) dispatch({ type: "fail" });
      else {
        dispatch({ type: "succeed" });
        onComplete(state.fileName);
      }
    }
  }, [state, onComplete]);

  /** Starts an upload for the chosen file. A bad file type or size ends in the failed state. */
  function choose(file: File | undefined) {
    if (!file) return;
    failNext.current = !checkFile(file.name, file.size);
    dispatch({ type: "start", fileName: file.name, size: file.size });
  }

  /** Throws the file away and tells the page. */
  function clear() {
    dispatch({ type: "cancel" });
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }

  return (
    <div className="grid gap-3">
      <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl bg-muted p-4">
        {state.status === "idle" ? (
          <Upload className="h-12 w-12 text-muted-foreground" aria-hidden />
        ) : (
          <UploadChip state={state} onRetry={() => dispatch({ type: "retry" })} onClear={clear} onReadd={() => inputRef.current?.click()} />
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="event-pdf">PDF Upload</Label>
        <Input
          id="event-pdf"
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => {
            choose(e.target.files?.[0]);
            // Reset so picking the same file again still fires a change.
            e.target.value = "";
          }}
        />
        <p className="text-sm text-muted-foreground">
          {fileName ? fileName : "Choose a file to upload"}
        </p>
      </div>
    </div>
  );
}

/** The pill showing one upload's progress, success or failure, with its action buttons. */
function UploadChip({
  state,
  onRetry,
  onClear,
  onReadd,
}: {
  state: Exclude<UploadState, { status: "idle" }>;
  onRetry: () => void;
  onClear: () => void;
  onReadd: () => void;
}) {
  const failed = state.status === "error";
  return (
    <div
      className={cn(
        "flex w-full max-w-md items-center gap-3 rounded-lg border bg-card px-3 py-2",
        failed && "border-destructive text-destructive"
      )}
    >
      {state.status === "uploading" && <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />}
      {state.status === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-hidden />}
      {failed && <FileText className="h-5 w-5 shrink-0" aria-hidden />}
      <div className="min-w-0 flex-1 text-sm" role={failed ? "alert" : "status"}>
        <p className="truncate font-medium">{state.fileName}</p>
        <p className={failed ? "" : "text-muted-foreground"}>
          {state.status === "uploading" && `Uploading - ${state.percent}%`}
          {state.status === "success" && `Uploaded - ${formatFileSize(state.size)}`}
          {failed && "Upload failed. Try again."}
        </p>
      </div>
      {failed && (
        <button type="button" onClick={onRetry} aria-label="Retry upload" className="rounded p-1 hover:bg-muted">
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
      <button type="button" onClick={onClear} aria-label="Remove file" className="rounded p-1 hover:bg-muted">
        <X className="h-4 w-4" />
      </button>
      <button type="button" onClick={onReadd} aria-label="Choose another file" className="rounded p-1 hover:bg-muted">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
