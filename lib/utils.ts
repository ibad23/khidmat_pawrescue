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
 * Format a cage number to display format (e.g., 1 -> "GW-C01")
 */
export function formatCageNo(cageNo: number, wardCode?: string): string {
  const code = wardCode || "GW";
  return `${code}-C${String(cageNo).padStart(2, "0")}`;
}

/**
 * Format a Date object for datetime-local input
 */
export function formatForDatetimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Format a date string for display (e.g., "14 Feb 2024")
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a datetime string for display (e.g., "14 Feb 2024, 2:30 PM")
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Map a status string to a color key
 */
export function mapStatusToColor(status?: string): StatusColor {
  if (!status) return "purple";
  const s = status.toLowerCase();

  // Danger/Red - Critical or expired
  if (s.includes("expired") || s.includes("critical") || s.includes("deceased") || s.includes("dead")) {
    return "danger";
  }

  // Info/Blue - Under treatment or recovering
  if (s.includes("under treatment") || s.includes("treatment") || s.includes("recovering")) {
    return "info";
  }

  // Success/Green - Healthy outcomes
  if (s.includes("healthy") || s.includes("recovered") || s.includes("move") || s.includes("stable")) {
    return "success";
  }

  // Warning/Orange - Adoption-related or pending
  if (s.includes("adopt") || s.includes("available") || s.includes("pending")) {
    return "warning";
  }

  // Purple - Discharged/Foster/Released
  if (s.includes("discharge") || s.includes("foster") || s.includes("released")) {
    return "purple";
  }

  return "purple";
}
