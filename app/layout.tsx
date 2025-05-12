import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gold Calulator',
  description: 'Gold price calculator',
  generator: 'Gold Calulator',
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
