import type { Snapshot } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const primaryValue = (s: Snapshot): string => {
  if (s.mode === "ticker") return s.value.toFixed(2);
  return s.cpu.toFixed(1);
};

export const primaryUnit = (s: Snapshot): string => {
  if (s.mode === "ticker") return "";
  return "%";
};
