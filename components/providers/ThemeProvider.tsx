"use client"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  defaultTheme?: string
  enableSystem?: boolean
}

export function ThemeProvider({ children, defaultTheme = "system", enableSystem = true }: Props) {
  return (
    <NextThemeProvider defaultTheme={defaultTheme} enableSystem={enableSystem}>
      {children}
    </NextThemeProvider>
  )
} 