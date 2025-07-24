"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, Home, Building, Info } from "lucide-react"
import { cancelBooking } from "@/app/actions/cancel-booking"

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null)
  const [dayOfWeek, setDayOfWeek] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        console.log("Fetching booking with ID:", params.id)

        // First, check if the booking ID is valid
        if (!params.id) {
          throw new Error("No booking ID provided")
        }

        // Attempt to fetch the booking
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*, customer:customer_id(*)")
          .eq("id", params.id)
          .single()

        // Log the raw response for debugging
        console.log("Supabase response:", { data: bookingData, error: bookingError })
        setDebugInfo({ bookingData, bookingError })

        if (bookingError) {
          throw new Error(`Database error: ${bookingError.message}`)
        }

        if (!bookingData) {
          throw new Error("Booking not found in database")
        }

        setBooking(bookingData)
        setCustomer(bookingData.customer)

        // Extract confirmation number from special instructions
        if (bookingData.special_instructions) {
          const confirmMatch = bookingData.special_instructions.match(/\[Confirmation: (CL\d+)\]/)
          if (confirmMatch && confirmMatch[1]) {
            setConfirmationNumber(confirmMatch[1])
          }

          // Extract day of week from special instructions
          const dayMatch = bookingData.special_instructions.match(/\[Day of Week: (.*?)\]/)
          if (dayMatch && dayMatch[1]) {
            setDayOfWeek(dayMatch[1])
          }
        }
      } catch (error) {
        console.error("Error fetching booking details:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookingDetails()
  }, [params.id])

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    setIsCancelling(true)
    try {
      const result = await cancelBooking(params.id)
      if (result.success) {
        router.push("/booking/history")
      } else {
        setError(result.error || "Failed to cancel booking")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  // Format the special instructions to remove the confirmation number and day of week
  const formatSpecialInstructions = (instructions: string) => {
    if (!instructions) return ""
    return instructions
      .replace(/\[Confirmation: CL\d+\]/g, "")
      .replace(/\[Day of Week: .*?\]/g, "")
      .trim()
  }

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

  if (error || !booking || !customer) {
    return (
      <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold mb-4 text-center">Error Loading Booking</h2>
                <p className="text-red-500 mb-4 text-center">{error || "Failed to load booking details"}</p>

                {/* Add debug information */}
                {debugInfo && (
                  <div className="mt-6 p-4 bg-gray-100 rounded-md">
                    <h3 className="font-medium mb-2">Debug Information:</h3>
                    <p className="text-sm mb-2">Booking ID: {params.id}</p>
                    <pre className="text-xs overflow-auto bg-gray-200 p-2 rounded">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-center mt-6">
                  <Button asChild className="mr-4">
                    <Link href="/booking/manage">Back to Manage Bookings</Link>
                  </Button>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Format the date with the day of week if available
  const formatDate = () => {
    try {
      // Get the raw date from the booking
      const rawDate = booking.booking_date
      console.log("Raw booking date:", rawDate)

      // Parse the date string (YYYY-MM-DD)
      const [year, month, day] = rawDate.split("-").map(Number)

      // Create a date object (use UTC to avoid timezone issues)
      const bookingDate = new Date(Date.UTC(year, month - 1, day))
      console.log("Parsed booking date:", bookingDate.toISOString())

      // Format the date without day of week
      const formattedDate = new Date(rawDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      // Use the day of week from special instructions if available
      if (dayOfWeek) {
        console.log("Using day of week from special instructions:", dayOfWeek)
        return `${dayOfWeek}, ${formattedDate}`
      }

      // Otherwise calculate it (but this might be wrong due to timezone issues)
      const calculatedDayOfWeek = bookingDate.toLocaleDateString("en-US", { weekday: "long" })
      console.log("Calculated day of week:", calculatedDayOfWeek)
      return `${calculatedDayOfWeek}, ${formattedDate}`
    } catch (error) {
      console.error("Error formatting date:", error)
      return booking.booking_date || "Date not available"
    }
  }

  const isPastBooking = new Date() > new Date(booking.booking_date)
  const canRebook = isPastBooking || booking.status === "cancelled" || booking.status === "completed"

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="container mx-auto px-4 py-8">
        <Link href="/booking/manage" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Manage Bookings
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {confirmationNumber && (
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <h3 className="font-bold text-lg mb-1">Confirmation Number</h3>
                  <p className="text-xl font-mono">{confirmationNumber}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Appointment Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p>{formatDate()}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p>{booking.booking_time}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 mr-2 mt-0.5 flex items-center justify-center text-yellow-600">
                        <span className="font-bold">$</span>
                      </div>
                      <div>
                        <p className="font-medium">Total Price</p>
                        <p>${booking.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 mr-2 mt-0.5 flex items-center justify-center text-yellow-600 rounded-full border border-yellow-600">
                        <span className="text-xs font-bold">i</span>
                      </div>
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="capitalize">{booking.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="h-5 w-5 mr-2 mt-0.5 text-yellow-600 flex items-center justify-center">
                        <span className="font-bold">@</span>
                      </div>
                      <div>
                        <p className="font-medium">Name</p>
                        <p>
                          {customer.first_name} {customer.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p>{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p>{customer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p>
                          {customer.address}
                          {customer.unit_number ? `, ${customer.unit_number}` : ""}
                        </p>
                        <p>
                          {customer.city}, {customer.state} {customer.zip_code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {customer.property_type ? (
                <div>
                  <h3 className="font-bold text-lg mb-2">Property Information</h3>
                  <div className="flex items-start">
                    {customer.property_type === "house" ? (
                      <Home className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                    ) : (
                      <Building className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">Property Type</p>
                      <p className="capitalize">{customer.property_type}</p>
                      {customer.property_type === "house" && customer.floors && <p>{customer.floors} Floor(s)</p>}
                      {customer.property_type === "apartment" && customer.floor_level && (
                        <p>Floor Level: {customer.floor_level}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {formatSpecialInstructions(booking.special_instructions) && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Special Instructions</h3>
                  <div className="flex items-start">
                    <Info className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="whitespace-pre-wrap">{formatSpecialInstructions(booking.special_instructions)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                {canRebook && (
                  <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                    <Link href={`/booking/details/${params.id}/rebook`}>Book Again</Link>
                  </Button>
                )}
                {!isPastBooking && booking.status !== "cancelled" && (
                  <Button
                    onClick={handleCancelBooking}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
