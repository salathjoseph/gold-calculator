import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'gold-calculator',
  description: 'gold-calculator',
  generator: 'gold-calculator',
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