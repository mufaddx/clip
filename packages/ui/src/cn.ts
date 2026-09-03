import clsx, { type ClassValue } from "clsx";

/** Class-name composition helper used by every component for the `className` override rule. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
