import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { BookingProvider } from "@/lib/booking-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "F5 Carpet Cleaning - Professional Carpet Cleaning Services",
  description: "Professional carpet, upholstery, and tile cleaning services in Tampa Bay. Book online today!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  )
}
