// * Utility Functions
// ? Common helper functions used throughout the application

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// * Class Name Merger
// ? Combines multiple class names using clsx and tailwind-merge
// ! Important for handling Tailwind CSS class conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
