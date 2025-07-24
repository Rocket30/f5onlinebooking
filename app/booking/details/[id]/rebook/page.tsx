"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { ArrowLeft, ArrowRight, Clock, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

const timeSlots = [
  "10:00 AM - 11:30 AM",
  "11:30 AM - 1:00 PM",
  "1:00 PM - 2:30 PM",
  "2:30 PM - 4:00 PM",
  "4:00 PM - 5:30 PM",
]

export default function RebookPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [originalBooking, setOriginalBooking] = useState<any | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rebookingError, setRebookingError] = useState<string | null>(null)
  const [isRebooking, setIsRebooking] = useState(false)

  useEffect(() => {
    async function fetchOriginalBooking() {
      try {
        setIsLoading(true)

        const { data, error: fetchError } = await supabase
          .from("bookings")
          .select(`
            id,
            booking_date,
            booking_time,
            total_price,
            status,
            zip_code,
            special_instructions,
            customer:customer_id (
              id,
              first_name,
              last_name,
              email,
              phone,
              address,
              city,
              state,
              zip_code
            ),
            booking_services (
              service_id,
              quantity,
              price
            ),
            booking_rooms (
              room_type,
              quantity,
              price
            )
          `)
          .eq("id", bookingId)
          .single()

        if (fetchError) throw fetchError

        setOriginalBooking(data)
      } catch (err) {
        console.error("Error fetching original booking:", err)
        setError("Unable to fetch booking details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchOriginalBooking()
    }
  }, [bookingId])

  // Calculate available dates (next 14 days, excluding Sundays)
  const today = new Date()
  const twoWeeksLater = new Date()
  twoWeeksLater.setDate(today.getDate() + 14)

  const isDateUnavailable = (date: Date) => {
    // Disable Sundays and dates before today
    return date.getDay() === 0 || date < today
  }

  const handleRebook = async () => {
    if (!date || !selectedTimeSlot || !originalBooking) {
      setRebookingError("Please select a date and time")
      return
    }

    setIsRebooking(true)
    setRebookingError(null)

    try {
      // Create a new booking with the same details but new date/time
      const formattedDate = date.toISOString().split("T")[0]

      // Extract the services and rooms from the original booking
      const services = originalBooking.booking_services.map((service: any) => service.service_id)
      const rooms = originalBooking.booking_rooms.map((room: any) => {
        const [serviceId, roomId] = room.room_type.split("-")
        return {
          serviceId,
          roomId,
          count: room.quantity,
        }
      })

      // Redirect to the details page with all the information pre-filled
      const queryParams = new URLSearchParams({
        zip: originalBooking.zip_code,
        services: services.join(","),
        rooms: originalBooking.booking_rooms.map((room: any) => room.room_type + "-" + room.quantity).join(","),
        date: formattedDate,
        time: encodeURIComponent(selectedTimeSlot),
        price: originalBooking.total_price.toString(),
        totalRooms: "5", // Assuming the standard room count
        rebook: "true",
        customerId: originalBooking.customer.id,
      })

      router.push(`/booking/details?${queryParams.toString()}`)
    } catch (err) {
      console.error("Error rebooking:", err)
      setRebookingError("An unexpected error occurred. Please try again.")
    } finally {
      setIsRebooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <p>Loading booking details...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !originalBooking) {
    return (
      <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-red-500 mb-4">{error || "Booking not found"}</p>
                <Link href="/booking/history">
                  <Button variant="outline">Back to Booking History</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="container mx-auto px-4 py-8">
        <Link href={`/booking/details/${bookingId}`} className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Booking Details
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">REBOOK SERVICE</CardTitle>
              <CardDescription className="mt-2">
                Schedule the same service again with all your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Rebooking Previous Service</p>
                    <p className="text-sm text-green-700">
                      We'll use the same service details, rooms, and pricing from your previous booking.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Select a New Date</h3>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={isDateUnavailable}
                      fromDate={today}
                      toDate={twoWeeksLater}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                {date && (
                  <div>
                    <h3 className="font-medium mb-4">Select a Time</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {timeSlots.map((timeSlot) => (
                        <div
                          key={timeSlot}
                          className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                            selectedTimeSlot === timeSlot
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedTimeSlot(timeSlot)}
                        >
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{timeSlot}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {date && selectedTimeSlot && (
                  <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                    <h3 className="font-bold text-lg mb-2">Booking Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Services:</span>
                        <span>{originalBooking.booking_services.length} service(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rooms:</span>
                        <span>{originalBooking.booking_rooms.length} room(s)</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total Price:</span>
                        <span>${originalBooking.total_price}</span>
                      </div>
                    </div>
                  </div>
                )}

                {rebookingError && <p className="text-red-500 text-sm">{rebookingError}</p>}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleRebook}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    disabled={!date || !selectedTimeSlot || isRebooking}
                  >
                    {isRebooking ? "Processing..." : "Continue to Details"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
