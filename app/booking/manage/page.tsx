"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AlertCircle } from "lucide-react"

export default function ManageBookingPage() {
  const router = useRouter()
  const [confirmationNumber, setConfirmationNumber] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFindBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!confirmationNumber) {
      setError("Please enter a booking ID or confirmation number")
      setIsLoading(false)
      return
    }

    try {
      const { data: bookings, error: searchError } = await supabase
        .from("bookings")
        .select("id, special_instructions")
        .ilike("special_instructions", `%[Confirmation: ${confirmationNumber}]%`)
        .limit(1)

      if (searchError) {
        throw new Error(searchError.message)
      }

      if (!bookings || bookings.length === 0) {
        const { data: directBooking, error: directError } = await supabase
          .from("bookings")
          .select("id")
          .eq("id", confirmationNumber)
          .single()

        if (directError || !directBooking) {
          setError("Booking not found. Please check your booking ID or confirmation number and try again.")
          setIsLoading(false)
          return
        }

        router.push(`/booking/details/${directBooking.id}`)
      } else {
        router.push(`/booking/details/${bookings[0].id}`)
      }
    } catch (error) {
      console.error("Error finding booking:", error)
      setError("An error occurred while searching for your booking. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Manage Your Booking</CardTitle>
              <CardDescription>
                Enter your booking ID or confirmation number to view, reschedule, or cancel your appointment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Find Your Booking by ID</h3>
                  <form onSubmit={handleFindBooking} className="space-y-4">
                    <div>
                      <label htmlFor="confirmationNumber" className="block text-sm font-medium mb-1">
                        Booking ID or Confirmation Number
                      </label>
                      <Input
                        id="confirmationNumber"
                        value={confirmationNumber}
                        onChange={(e) => setConfirmationNumber(e.target.value)}
                        placeholder="Enter your booking ID or confirmation number"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                      disabled={isLoading}
                    >
                      {isLoading ? "Searching..." : "Find My Booking"}
                    </Button>
                  </form>
                </div>

                {error && (
                  <div className="bg-red-50 p-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <p className="text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
