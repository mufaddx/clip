"use client";

import * as React from "react";
import { cn } from "./cn";

// See docs/ui-ux/DESIGN_SYSTEM.md "Modals" — centered, xl radius, backdrop blur+dim.
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg")}>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <div className="mt-4">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
