import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Prefix path with basePath for client-side fetch (required when using basePath) */
export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ""
  return `${base}${path.startsWith("/") ? path : "/" + path}`
}

