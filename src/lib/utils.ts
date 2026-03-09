import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return format(parseISO(dateStr), "MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateRange(start: string, end: string | null): string {
  const s = formatDate(start);
  if (!end) return s;
  const e = formatDate(end);
  return s === e ? s : `${s} – ${e}`;
}

export function getRegionColor(region: string): string {
  const map: Record<string, string> = {
    Asia: "bg-orange-100 text-orange-700",
    Europe: "bg-blue-100 text-blue-700",
    Americas: "bg-green-100 text-green-700",
    Africa: "bg-yellow-100 text-yellow-700",
    Oceania: "bg-purple-100 text-purple-700",
    "Middle East": "bg-red-100 text-red-700",
  };
  return map[region] ?? "bg-gray-100 text-gray-700";
}
