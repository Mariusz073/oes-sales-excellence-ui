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

export function getHighPerformanceColor(
  resultStr: string | undefined
): string | undefined {
  if (!resultStr) return undefined;
  const match = resultStr.match(/\((\d+(?:\.\d+)?)%\)/);
  const percentage = match ? parseFloat(match[1]) : 0;
  return percentage >= 90 ? "#4ade80" : undefined; // bright green if >= 90%
}
