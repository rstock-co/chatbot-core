import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names with Tailwind CSS
 * This matches the pattern used in shadcn/ui and Assistant UI
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
