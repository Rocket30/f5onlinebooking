"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, AlertCircle } from "lucide-react"
import { useBookingContext } from "@/lib/booking-context"
import { createBooking } from "@/app/actions/booking-direct"

const timeSlots = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
]

export default function SchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { bookingData, updateBookingData } = useBookingContext()

  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate available dates (next 14 days)
  useEffect(() => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Format as YYYY-MM-DD for value
      const formattedDate = date.toISOString().split("T")[0]
      dates.push(formattedDate)
    }

    setAvailableDates(dates)

    // Set default selected date to first available date
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0])
    }
  }, [selectedDate])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time)
  }

  const handleContinue = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select both a date and time")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // If this is a direct booking (not part of the wizard flow)
      const directBooking = searchParams?.get("direct") === "true"

      if (directBooking) {
        // Get customer data from URL params
        const customerData = {
          firstName: searchParams?.get("firstName") || "",
          lastName: searchParams?.get("lastName") || "",
          email: searchParams?.get("email") || "",
          phone: searchParams?.get("phone") || "",
          address: searchParams?.get("address") || "",
          city: searchParams?.get("city") || "",
          state: searchParams?.get("state") || "",
          zipCode: searchParams?.get("zipCode") || "",
          specialInstructions: searchParams?.get("specialInstructions") || "",
        }

        // Calculate the day of week
        const bookingDate = new Date(selectedDate)
        const dayOfWeek = bookingDate.toLocaleDateString("en-US", { weekday: "long" })

        // Create the booking directly
        const result = await createBooking({
          ...customerData,
          date: selectedDate,
          time: selectedTime,
          dayOfWeek: dayOfWeek,
          totalPrice: 150, // Default price for direct bookings
        })

        if (result.success) {
          router.push(`/booking/confirmation?confirmation=${result.confirmationNumber}&id=${result.bookingId}`)
        } else {
          setError(result.error || "Failed to create booking")
          setIsLoading(false)
        }
      } else {
        // Update booking context with selected date and time
        updateBookingData({
          ...bookingData,
          date: selectedDate,
          time: selectedTime,
          // Calculate and store the day of week
          dayOfWeek: new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }),
        })

        // Continue to next step in booking flow
        router.push("/booking/details")
      }
    } catch (error) {
      console.error("Error in schedule selection:", error)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="container mx-auto px-4 py-8">
        <Link href="/booking/rooms" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Room Selection
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Select Date & Time</CardTitle>
              <CardDescription className="text-center">Choose when you'd like your cleaning service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary of selected services and rooms */}
              {bookingData.services && bookingData.services.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Selected Services:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {bookingData.services.map((service) => (
                      <li key={service.id}>
                        {service.name} {service.quantity > 1 ? `(${service.quantity})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {bookingData.rooms && bookingData.rooms.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Selected Rooms:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {bookingData.rooms.map((room) => (
                      <li key={room.type}>
                        {room.name} {room.quantity > 1 ? `(${room.quantity})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-3">Select a Date</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableDates.map((date) => (
                    <label
                      key={date}
                      className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedDate === date
                          ? "bg-yellow-500 text-black border-yellow-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="date"
                        value={date}
                        checked={selectedDate === date}
                        onChange={handleDateChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-sm">
                          {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div className="font-medium">{new Date(date).getDate()}</div>
                        <div className="text-xs">{new Date(date).toLocaleDateString("en-US", { month: "short" })}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Select a Time</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSelection(time)}
                      className={`p-3 border rounded-md transition-colors flex items-center justify-center ${
                        selectedTime === time
                          ? "bg-yellow-500 text-black border-yellow-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && selectedTime && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-1">Your Selected Appointment</h3>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 p-4 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={!selectedDate || !selectedTime || isLoading}
                >
                  {isLoading ? "Processing..." : "Continue to Customer Details"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
