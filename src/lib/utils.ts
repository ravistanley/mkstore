import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  const lowerUrl = trimmed.toLowerCase();
  
  // Restrict to safe image protocols
  if (
    lowerUrl.startsWith("http://") || 
    lowerUrl.startsWith("https://") || 
    lowerUrl.startsWith("/") || 
    lowerUrl.startsWith("data:image/")
  ) {
    return trimmed;
  }
  
  return "";
}
