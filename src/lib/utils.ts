import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function scoreColor(score: number): string {
  if (score >= 85) return "text-scout-green";
  if (score >= 70) return "text-scout-cyan";
  if (score >= 50) return "text-scout-amber";
  return "text-muted-foreground";
}

export function scoreBadgeVariant(
  score: number
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 85) return "default";
  if (score >= 70) return "secondary";
  return "outline";
}
