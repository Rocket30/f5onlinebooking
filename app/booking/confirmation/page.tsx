"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null)
  const [dayOfWeek, setDayOfWeek] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Get confirmation number from URL
        const confirmation = searchParams?.get("confirmation")
        if (!confirmation) {
          throw new Error("No confirmation number provided")
        }

        setConfirmationNumber(confirmation)

        // Try to find the booking by confirmation number in special_instructions
        const { data: bookings, error: searchError } = await supabase
          .from("bookings")
          .select("*, customer:customer_id(*)")
          .ilike("special_instructions", `%[Confirmation: ${confirmation}]%`)
          .limit(1)

        if (searchError) {
          throw new Error(`Error searching for booking: ${searchError.message}`)
        }

        if (!bookings || bookings.length === 0) {
          // If not found by confirmation number, try by ID
          const bookingId = searchParams?.get("id")
          if (!bookingId) {
            throw new Error("Booking not found and no ID provided")
          }

          const { data: directBooking, error: directError } = await supabase
            .from("bookings")
            .select("*, customer:customer_id(*)")
            .eq("id", bookingId)
            .single()

          if (directError || !directBooking) {
            throw new Error("Booking not found")
          }

          setBooking(directBooking)

          // Extract day of week from special instructions if available
          if (directBooking.special_instructions) {
            const dayOfWeekMatch = directBooking.special_instructions.match(/\[Day of Week: (.*?)\]/)
            if (dayOfWeekMatch && dayOfWeekMatch[1]) {
              setDayOfWeek(dayOfWeekMatch[1])
            }
          }
        } else {
          setBooking(bookings[0])

          // Extract day of week from special instructions if available
          if (bookings[0].special_instructions) {
            const dayOfWeekMatch = bookings[0].special_instructions.match(/\[Day of Week: (.*?)\]/)
            if (dayOfWeekMatch && dayOfWeekMatch[1]) {
              setDayOfWeek(dayOfWeekMatch[1])
            }
          }
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookingDetails()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // If there's an error or no booking found, show a friendly error message
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center bg-yellow-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-bold mb-4">We couldn't find your booking</h2>
                <p className="mb-6">
                  {error ||
                    "The booking information could not be found. It may have been deleted or the link is incorrect."}
                </p>

                {confirmationNumber && (
                  <div className="bg-gray-100 p-4 rounded-md mb-6">
                    <p className="font-medium">Confirmation Number:</p>
                    <p className="text-xl font-mono">{confirmationNumber}</p>
                  </div>
                )}

                <div className="flex flex-col space-y-3">
                  <Link href="/booking/manage" passHref>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">Find My Booking</Button>
                  </Link>
                  <Link href="/booking" passHref>
                    <Button variant="outline" className="w-full">
                      Create New Booking
                    </Button>
                  </Link>
                  <Link href="/" passHref>
                    <Button variant="ghost" className="w-full">
                      Return to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Format the date with the day of week if available
  const formatDate = (dateString: string) => {
    try {
      console.log("Formatting date:", dateString)

      // Parse the date string (YYYY-MM-DD)
      const [year, month, day] = dateString.split("-").map(Number)

      // Create a date object (use UTC to avoid timezone issues)
      const date = new Date(Date.UTC(year, month - 1, day))
      console.log("Parsed date:", date.toISOString())

      // Format the date without day of week
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      // Add day of week if available
      if (dayOfWeek) {
        console.log("Using day of week from special instructions:", dayOfWeek)
        return `${dayOfWeek}, ${formattedDate}`
      }

      // Otherwise calculate it (but this might be wrong due to timezone issues)
      return formattedDate
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString || "Date not available"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center bg-green-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl">BOOKING CONFIRMED!</CardTitle>
              <CardDescription className="text-white mt-2">Your cleaning service has been scheduled</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-lg font-medium">Confirmation Number</div>
                <div className="text-3xl font-bold text-green-600 mt-1">{confirmationNumber}</div>
                <div className="text-sm text-gray-500 mt-2">Please save this number for your records</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">Appointment Details</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{booking.booking_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">
                        {booking.booking_services?.length > 0
                          ? booking.booking_services.map((s) => s.service?.name).join(", ")
                          : "Carpet Cleaning"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{booking.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Service Location</h3>
                  <div className="text-gray-700">
                    <p>
                      {booking.customer.address}
                      {booking.customer.unit_number ? `, ${booking.customer.unit_number}` : ""}
                    </p>
                    <p>
                      {booking.customer.city}, {booking.customer.state} {booking.customer.zip_code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-md">
                  <h3 className="font-medium text-yellow-800 mb-1">Important Information</h3>
                  <p className="text-sm text-yellow-700">
                    Save the confirmation number to use to manage your appointment to reschedule or cancel your
                    appointment.
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <Link href={`/booking/manage`} passHref>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">Manage My Booking</Button>
                  </Link>
                  <Link href="/" passHref>
                    <Button variant="outline" className="w-full">
                      Return to Home
                    </Button>
                  </Link>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>
                    Need help?{" "}
                    <Link href="tel:8135626516" className="text-yellow-600 hover:underline">
                      Call us at 813-562-6516
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
