import type { Metadata } from 'next'
import Script from 'next/script'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif"
})

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
})

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://furniblog.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Furniblog — Premium Chair Reviews, Videos & News',
    template: '%s | Furniblog',
  },
  description:
    "The world's most comprehensive database for premium office, gaming and ergonomic chairs. Real specs, global reviews, videos and news — updated daily.",
  applicationName: 'Furniblog',
  keywords: [
    'office chair reviews',
    'ergonomic chair',
    'gaming chair',
    'Herman Miller',
    'Steelcase',
    'chair comparison',
  ],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Furniblog',
    title: 'Furniblog — Premium Chair Reviews, Videos & News',
    description:
      'Global office & ergonomic chair reviews, videos and news in one place — updated daily.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furniblog — Premium Chair Reviews, Videos & News',
    description:
      'Global office & ergonomic chair reviews, videos and news in one place — updated daily.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
