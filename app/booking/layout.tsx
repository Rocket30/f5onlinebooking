"use client"

import type React from "react"
import { BookingProvider } from "@/lib/booking-context"

export const dynamic = "force-dynamic"

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <BookingProvider>{children}</BookingProvider>
}
