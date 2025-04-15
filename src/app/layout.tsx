"use client";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SitesProvider } from "@/contexts/SitesContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SitesProvider>{children}</SitesProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
