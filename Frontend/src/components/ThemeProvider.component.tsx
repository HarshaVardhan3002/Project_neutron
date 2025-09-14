/**
 * @fileoverview A client-side component that provides theme management (dark/light/system)
 * to the entire application, using the `next-themes` library.
 */
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

/**
 * A wrapper around the `next-themes` ThemeProvider to make it a client component.
 * This allows the application to switch between themes without a full page reload.
 * @param {ThemeProviderProps} props - The props for the `next-themes` provider.
 * @returns {JSX.Element} The theme provider component.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
