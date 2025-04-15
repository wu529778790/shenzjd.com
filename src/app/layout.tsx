"use client";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { useFork } from "@/hooks/useFork";
import { SitesProvider } from "@/contexts/SitesContext";
import { ForkDialog } from "@/components/ForkDialog";

function ForkWrapper({ children }: { children: React.ReactNode }) {
  const { showForkDialog, setShowForkDialog, handleFork } = useFork();
  return (
    <>
      {children}
      <ForkDialog
        open={showForkDialog}
        onOpenChange={setShowForkDialog}
        onConfirm={handleFork}
      />
    </>
  );
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
              <SitesProvider>{children}</SitesProvider>
            </ThemeProvider>
          </ForkWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
