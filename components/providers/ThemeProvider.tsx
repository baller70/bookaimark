"use client"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  attribute?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  attribute = "class",
}: Props) {
  return (
    <NextThemeProvider
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      attribute={attribute as any}
    >
      {children}
    </NextThemeProvider>
  )
} 