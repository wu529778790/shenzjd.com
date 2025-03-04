"use client";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { useFork } from "@/hooks/useFork";

function ForkWrapper({ children }: { children: React.ReactNode }) {
  useFork();
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ForkWrapper>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </ForkWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
