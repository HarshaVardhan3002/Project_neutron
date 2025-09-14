/**
 * @fileoverview General utility functions for the application.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to merge Tailwind CSS classes with clsx.
 * It conditionally joins class names together and intelligently resolves 
 * conflicting Tailwind classes, ensuring a clean and predictable final class string.
 * 
 * Example: cn('p-4', 'bg-red-500', isLarge && 'p-8') -> 'bg-red-500 p-8' if isLarge is true.
 * 
 * @param {...ClassValue[]} inputs - A list of class names, objects, or arrays to be merged.
 * @returns {string} The merged and optimized class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
