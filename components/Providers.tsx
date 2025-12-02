"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Force a deterministic default theme on the server to avoid hydration mismatches
  // during development. We disable system preference so server and client render
  // the same initial theme class. App can still allow users to switch theme.
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
      {/* Sonner Toaster for global toast notifications */}
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
