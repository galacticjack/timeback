import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://timeback.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TimeBack - Visual Website Time Machine | See How Sites Evolved',
    template: '%s | TimeBack'
  },
  description: 'Rewind any website through time with beautiful visual timelines and AI-powered insights. Compare snapshots, track changes, and discover how the web evolved.',
  keywords: [
    'wayback machine',
    'website archive',
    'website history',
    'visual timeline',
    'AI insights',
    'web archive',
    'website comparison',
    'internet history',
    'website evolution',
    'web time machine',
    'site changes',
    'before and after',
    'website redesign'
  ],
  authors: [{ name: 'TimeBack Team' }],
  creator: 'TimeBack',
  publisher: 'TimeBack',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'TimeBack',
    title: 'TimeBack - Visual Website Time Machine',
    description: 'See how websites evolved over time with AI-powered insights. Compare snapshots and discover the history of the web.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TimeBack - Visual Website Time Machine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TimeBack - Visual Website Time Machine',
    description: 'Rewind any website through time. Compare snapshots, see redesigns, and get AI-powered insights.',
    images: ['/og-image.png'],
    creator: '@timeback_app',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'TimeBack',
  description: 'Visual website time machine that lets you see how any website evolved over time with AI-powered insights.',
  url: siteUrl,
  applicationCategory: 'Research Tool',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Visual timeline browsing',
    'Side-by-side comparison',
    'AI-powered insights',
    'Wayback Machine integration',
    'Keyboard shortcuts',
    'Mobile responsive'
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-white text-gray-900`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
