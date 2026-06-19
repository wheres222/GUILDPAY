import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  weight: ['400', '500', '700'],
  variable: '--font-inter'
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ['500', '700', '800'],
  variable: '--font-jakarta'
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ['400', '500'],
  style: ['italic', 'normal'],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: 'Guild Pay - Discord Marketplace Bot',
  description: 'The ultimate Discord bot for facilitating direct purchases and creating seamless marketplace experiences within your server.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/icon-light-32x32.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
