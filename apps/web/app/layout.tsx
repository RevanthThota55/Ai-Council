import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Council Portal',
  description: 'Multi-agent AI collaboration platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
