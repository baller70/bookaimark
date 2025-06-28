import { SafariDemo } from "./components/SafariDemo";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <ThemeToggle />
        <SafariDemo />
      </div>
    </ThemeProvider>
  );
}

export default App;
