"use client";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { useFork } from "@/hooks/useFork";
import { SitesProvider } from "@/contexts/SitesContext";
import Script from "next/script";

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
      <head>
        <meta name="google-adsense-account" content="ca-pub-5258297935898402" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5258297935898402"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
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
