import * as React from "react";
import { cn } from "./cn";

// See docs/ui-ux/DESIGN_SYSTEM.md "Inputs" — label above, helper/error below, focus ring.
export interface FieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export function Field({ label, error, helperText, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label ? <span className="font-medium text-slate-700">{label}</span> : null}
      {children}
      {error ? <span className="text-danger-600">{error}</span> : helperText ? <span className="text-slate-500">{helperText}</span> : null}
    </label>
  );
}

const controlClass =
  "h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-400";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(controlClass, className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(controlClass, "h-auto min-h-[80px] py-2", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(controlClass, className)} {...props} />
);
Select.displayName = "Select";

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn("h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500", className)}
      {...props}
    />
  );
}
