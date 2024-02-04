import { ClerkProvider } from "@clerk/nextjs"
import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { dark } from '@clerk/themes'
import Topbar from "@/components/shared/Topbar"
import LeftSidebar from "@/components/shared/LeftSidebar"
import RightSidebar from "@/components/shared/RightSidebar"
import Bottombar from "@/components/shared/Bottombar"
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Palestino",
  description: "A Next.js 13 Palestino application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <Topbar />

          <main className="flex flex-row">
            <LeftSidebar />

            <section className="main-container">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </section>

            <RightSidebar />
          </main>

          <Bottombar />

        </ClerkProvider>
      </body>
    </html>
  )
}
