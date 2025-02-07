import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCollaborativePercentageScore(
  high_need_score: string
): string {
  return ((parseFloat(high_need_score) / 380) * 100).toFixed(1) + "%"; // 380 is the maximum score set out by Jason
}
