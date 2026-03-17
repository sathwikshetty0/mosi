import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MOSI AI',
  description: 'AI Interview Intelligence',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#161816] text-[#E0E2E0]`}>
        <main className="min-h-screen bg-[#161816] flex justify-center selection:bg-[#20D08A]/30 selection:text-white">
          <div className="w-full h-full max-w-3xl flex flex-col">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
