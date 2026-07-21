"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onCloseAction,
  title,
  actions,
  children,
}: {
  open: boolean;
  onCloseAction: () => void;
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCloseAction}
      onCancel={onCloseAction}
      onClick={(e) => {
        if (e.target === ref.current) onCloseAction();
      }}
      className="fixed top-1/2 left-1/2 m-0 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-0 text-card-foreground shadow-lg backdrop:bg-black/40"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="text-base font-semibold tracking-tight">{title}</div>
        <div className="flex shrink-0 items-center gap-3">
          {actions}
          <button
            type="button"
            onClick={onCloseAction}
            aria-label="Close"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}
