import { NavigationProgress } from "@/components/NavigationProgress"
import type { Metadata } from 'next'
import Script from 'next/script'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PageviewTracker } from '@/components/analytics/PageviewTracker'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif"
})

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
})

import { SITE_URL, SITE_DESCRIPTION } from "@/lib/site-config"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Chairpedia - Chair Comparisons, Reviews & Buying Guides',
    template: '%s | Chairpedia',
  },
  description:
    SITE_DESCRIPTION,
  applicationName: 'Chairpedia',
  keywords: [
    'office chair reviews',
    'ergonomic chair',
    'gaming chair',
    'Herman Miller',
    'Steelcase',
    'chair comparison',
  ],
  // NOTE: no global canonical here — a layout-level canonical would make every
  // child page canonicalize to "/", telling Google they're duplicates of the
  // homepage. Each page sets its own canonical (or self-canonicalizes).
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    type: 'website',
    siteName: 'Chairpedia',
    title: 'Chairpedia - Chair Comparisons, Reviews & Buying Guides',
    description:
      SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chairpedia - Chair Comparisons, Reviews & Buying Guides',
    description:
      SITE_DESCRIPTION,
  },
  icons: {
    icon: [{ url: '/chairpedia-icon.svg', type: 'image/svg+xml' }],
    apple: '/chairpedia-icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <NavigationProgress />
        {children}
        <PageviewTracker />
        <GoogleAnalytics />
        <MicrosoftClarity />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
