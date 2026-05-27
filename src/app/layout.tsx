import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MicroBlog',
  description: 'A MicroBlog powered by Telegram channels',
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
