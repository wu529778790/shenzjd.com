"use client";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SitesProvider } from "@/contexts/SitesContext";
import { ForkProvider } from "@/components/ForkProvider";

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
            <ForkProvider>
              <SitesProvider>{children}</SitesProvider>
            </ForkProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
