import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats error objects or serialized Zod JSON issues into clean readable human text */
export function formatErrorMsg(error: unknown, fallback = "An unexpected error occurred"): string {
  if (!error) return fallback;
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.startsWith("[") && msg.endsWith("]")) {
    try {
      const parsed = JSON.parse(msg);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
        return parsed.map((p: { message: string }) => p.message).join(" • ");
      }
    } catch {
      // ignore
    }
  }
  return msg;
}
