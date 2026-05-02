import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
<<<<<<< HEAD
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrackIt - Discover & Track Opportunities',
  description: 'Find scholarships, internships, jobs, competitions, and more. Track your applications and never miss a deadline.',
  generator: 'v0.app',
=======
import './globals.css'

export const metadata: Metadata = {
  title: 'TrackIt - Discover & Track Opportunities',
  description: 'Find scholarships, internships, jobs, competitions, and more. Track your applications and never miss a deadline.',
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  keywords: ['opportunities', 'scholarships', 'internships', 'jobs', 'competitions', 'students', 'career'],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d9488' },
    { media: '(prefers-color-scheme: dark)', color: '#14b8a6' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
<<<<<<< HEAD
      <body className={`${outfit.className} antialiased min-h-screen`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
=======
      <body className="font-sans antialiased min-h-screen" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
          <Toaster position="top-right" richColors />
          {process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
