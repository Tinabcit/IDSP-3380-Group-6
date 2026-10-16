"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertCircle, Bell, CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/utils";

/** The look of a toast: green tick, red warning, or the bell used for reminders. */
export type ToastKind = "success" | "error" | "reminder";

/** What a caller passes to toast(). */
export interface ToastOptions {
  title: string;
  description?: string;
  kind?: ToastKind;
}

/** A toast that is currently on screen. */
interface ToastItem extends ToastOptions {
  id: number;
  kind: ToastKind;
}

/** How long a toast stays before it hides itself (reminders stay a bit longer). */
const DURATION_MS: Record<ToastKind, number> = { success: 4000, error: 6000, reminder: 8000 };

/** The most toasts shown at once; older ones are dropped first. */
const MAX_TOASTS = 4;

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

/**
 * Lets any component show a toast: `const toast = useToast(); toast({ title: "Saved" })`.
 * Must be used inside ToastProvider.
 */
export function useToast(): (options: ToastOptions) => void {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside ToastProvider");
  return toast;
}

/**
 * Holds the list of toasts and draws them in the top right corner of the
 * screen. Wrap the whole app in this once (see app/layout.tsx).
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  /** Removes one toast. */
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  /** Adds a toast and schedules it to hide itself. */
  const toast = useCallback(
    (options: ToastOptions) => {
      const item: ToastItem = { ...options, kind: options.kind ?? "success", id: nextId.current++ };
      setToasts((current) => [...current, item].slice(-MAX_TOASTS));
      window.setTimeout(() => dismiss(item.id), DURATION_MS[item.kind]);
    },
    [dismiss]
  );

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ol
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

/** One toast card: icon, title, optional description and a close button. */
function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const Icon = toast.kind === "reminder" ? Bell : toast.kind === "error" ? AlertCircle : CheckCircle2;
  return (
    <li
      role={toast.kind === "error" ? "alert" : "status"}
      className="pointer-events-auto flex items-start gap-3 rounded-md border bg-card p-3 text-card-foreground shadow-lg animate-in fade-in slide-in-from-right-4"
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          toast.kind === "success" && "text-done",
          toast.kind === "error" && "text-overdue",
          toast.kind === "reminder" && "text-primary"
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && <p className="text-sm text-muted-foreground">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </li>
  );
}
