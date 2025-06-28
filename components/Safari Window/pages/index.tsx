import React from "react";
import { SafariDemo } from "../src/components/SafariDemo";
import { ThemeProvider } from "../src/components/theme-provider";
import { ThemeToggle } from "../src/components/theme-toggle";

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <ThemeToggle />
        <SafariDemo />
      </div>
    </ThemeProvider>
  );
} 