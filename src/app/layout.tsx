import type { Metadata } from "next";
import { getEnv } from "../lib/env";
import "./globals.css";

const LOCALE = getEnv("LOCALE") ?? "en";
const SITE_URL = getEnv("SITE_URL") || "";
const CHANNEL = getEnv("CHANNEL");
const METADATA_BASE = SITE_URL.startsWith("http") ? new URL(SITE_URL) : undefined;

export const metadata: Metadata = {
  title: {
    default: "神族九帝",
    template: "%s | 神族九帝",
  },
  description: "A MicroBlog powered by Telegram channels",
  metadataBase: METADATA_BASE,
  alternates: {
    types: {
      "application/rss+xml": [{ title: "RSS", url: `${SITE_URL}rss.xml` }],
    },
  },
  openGraph: {
    type: "website",
    locale: LOCALE,
    siteName: "神族九帝",
  },
  twitter: {
    card: "summary",
  },
  robots: {
    index: !getEnv("NO_INDEX"),
    follow: !getEnv("NO_FOLLOW"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LOCALE.split("-")[0]} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}else if(t==='light'){document.documentElement.classList.remove('dark')}else if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "神族九帝",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}search/result?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
