import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Microblog',
  description: 'A microblog powered by Telegram channels',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
