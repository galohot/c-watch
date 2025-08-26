import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "C-Watch | Corruption Monitoring Dashboard",
  description: "Real-time corruption case monitoring and analytics dashboard with Bloomberg Terminal aesthetic",
  keywords: ["corruption", "monitoring", "dashboard", "analytics", "real-time", "transparency", "governance"],
  authors: [{ name: "C-Watch Team" }],
  creator: "C-Watch",
  publisher: "C-Watch",
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
    url: 'https://c-watch.vercel.app',
    title: 'C-Watch | Corruption Monitoring Dashboard',
    description: 'Real-time corruption case monitoring and analytics dashboard with Bloomberg Terminal aesthetic',
    siteName: 'C-Watch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'C-Watch | Corruption Monitoring Dashboard',
    description: 'Real-time corruption case monitoring and analytics dashboard with Bloomberg Terminal aesthetic',
    creator: '@cwatch',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-orange-400 font-mono`}
      >
        {children}
      </body>
    </html>
  )
}
