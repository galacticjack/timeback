import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TimeBack - Visual Website Time Machine',
  description: 'See how websites evolve over time with beautiful visual timelines and AI-powered insights. A modern alternative to the Wayback Machine.',
  keywords: 'wayback machine, website archive, website history, visual timeline, AI insights, web archive',
  openGraph: {
    title: 'TimeBack - Visual Website Time Machine',
    description: 'See how websites evolve over time with AI insights',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-tb-dark text-white`}>
        {children}
      </body>
    </html>
  )
}
