import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function getOrientation(
  width: number,
  height: number
): "LANDSCAPE" | "PORTRAIT" | "SQUARE" {
  if (width > height) return "LANDSCAPE";
  if (height > width) return "PORTRAIT";
  return "SQUARE";
}

export function formatAspectRatioFromDecimal(aspectRatio: number): string {
  const commonRatios: Record<string, number> = {
    "1:1": 1.0,
    "4:3": 1.333,
    "3:2": 1.5,
    "16:9": 1.778,
    "16:10": 1.6,
    "21:9": 2.333,
    "5:4": 1.25,
    "3:4": 0.75,
    "2:3": 0.667,
    "9:16": 0.5625,
    "10:16": 0.625,
  };

  for (const [ratio, value] of Object.entries(commonRatios)) {
    if (Math.abs(aspectRatio - value) < 0.05) {
      return ratio;
    }
  }

  if (aspectRatio >= 1) {
    return `${aspectRatio.toFixed(2)}:1`;
  } else {
    return `1:${(1 / aspectRatio).toFixed(2)}`;
  }
}
