import type { Metadata } from "next";
import { getEnv } from "../lib/env";
import "./globals.css";

const LOCALE = getEnv("LOCALE") ?? "en";

export const metadata: Metadata = {
  title: "神族九帝",
  description: "A MicroBlog powered by Telegram channels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LOCALE.split("-")[0]}>
      <body>{children}</body>
    </html>
  );
}
