import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StatusColor } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a cat ID number to display format (e.g., 1 -> "PA-0001")
 */
export function formatCatId(catId: number): string {
  return `PA-${String(catId).padStart(4, "0")}`;
}

/**
 * Format a cage number to display format (e.g., 1 -> "GW-C1")
 */
export function formatCageNo(cageNo: number): string {
  return `GW-C${cageNo}`;
}

/**
 * Format a Date object for datetime-local input
 */
export function formatForDatetimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Map a status string to a color key
 */
export function mapStatusToColor(status?: string): StatusColor {
  if (!status) return "purple";
  const s = status.toLowerCase();
  if (s.includes("expired")) return "danger";
  if (s.includes("under treatment")) return "info";
  if (s.includes("move") || s.includes("healthy")) return "success";
  if (s.includes("adopt")) return "warning";
  if (s.includes("discharge") || s.includes("foster")) return "purple";
  return "purple";
}
