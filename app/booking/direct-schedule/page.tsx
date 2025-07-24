"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { ArrowLeft, ArrowRight, Clock, CheckCircle } from "lucide-react"
import { Slideshow } from "@/components/slideshow"
import { useBooking } from "@/lib/booking-context"
import { checkZipCodeInServiceArea } from "@/app/actions/check-zip-code"

// Sample placeholder images for the slideshow
const placeholderImages = [
  "/placeholder.svg?height=1080&width=1920&text=Clean+Carpets",
  "/placeholder.svg?height=1080&width=1920&text=Fresh+Upholstery",
  "/placeholder.svg?height=1080&width=1920&text=Sparkling+Tiles",
]

const timeSlots = [
  "10:00 AM - 11:30 AM",
  "11:30 AM - 1:00 PM",
  "1:00 PM - 2:30 PM",
  "2:30 PM - 4:00 PM",
  "4:00 PM - 5:30 PM",
]

// Service names mapping
const serviceNames = {
  carpet: "Carpet Cleaning",
  upholstery: "Upholstery Cleaning",
  tile: "Tile & Grout Cleaning",
  "pet-treatment": "Pet Odor & Stain Treatment",
  "carpet-protection": "Carpet Protection",
  "upholstery-pet-treatment": "Pet Odor & Stain Treatment for Upholstery",
  "upholstery-protection": "Fabric Protection",
}

// Function to get time slot availability
const getTimeSlotAvailability = (date: Date | undefined): Record<string, boolean> => {
  if (!date) return {}

  // For now, make all time slots available
  return timeSlots.reduce(
    (acc, slot) => {
      acc[slot] = true // All slots are available
      return acc
    },
    {} as Record<string, boolean>,
  )
}

export default function DirectSchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { bookingData, updateBookingData, resetBooking } = useBooking()

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [timeSlotAvailability, setTimeSlotAvailability] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [zipCode, setZipCode] = useState("")

  // Get zip code from URL parameters
  useEffect(() => {
    const zip = searchParams.get("zip")
    if (zip) {
      setZipCode(zip)
      validateZipCode(zip)
    } else {
      setError("No ZIP code provided. Please enter your ZIP code to continue.")
      setIsLoading(false)
    }
  }, [searchParams])

  // Validate the zip code is in our service area
  const validateZipCode = async (zip: string) => {
    try {
      const result = await checkZipCodeInServiceArea(zip)

      if (result.isInServiceArea) {
        // Reset any existing booking data
        resetBooking()

        // Set up a new booking with this zip code and default carpet service
        updateBookingData({
          zipCode: zip,
          services: ["carpet"],
          rooms: [],
          price: 89, // Base price for carpet cleaning
          totalRooms: 0,
        })

        setIsLoading(false)
      } else {
        setError("We're sorry, but we don't currently service your area. Please contact us for more information.")
        setIsLoading(false)
      }
    } catch (err) {
      setError("An error occurred while checking service availability. Please try again.")
      setIsLoading(false)
    }
  }

  // Calculate available dates (next 3 months, excluding Sundays)
  const today = new Date()
  const threeMonthsLater = new Date()
  threeMonthsLater.setMonth(today.getMonth() + 3)

  const isDateUnavailable = (date: Date) => {
    // Disable Sundays and dates before today
    return date.getDay() === 0 || date < today
  }

  // Update time slot availability when date changes
  useEffect(() => {
    if (date) {
      // Reset selected time slot when date changes
      setSelectedTimeSlot(null)

      // Get availability for the selected date
      const availability = getTimeSlotAvailability(date)
      setTimeSlotAvailability(availability)
    }
  }, [date])

  const handleTimeSlotSelect = (timeSlot: string) => {
    // Only allow selecting available time slots
    if (timeSlotAvailability[timeSlot]) {
      setSelectedTimeSlot(timeSlot)
    }
  }

  const handleContinue = () => {
    if (!date) {
      setError("Please select a date")
      return
    }

    if (!selectedTimeSlot) {
      setError("Please select a time slot")
      return
    }

    const formattedDate = date.toISOString().split("T")[0]

    // Update booking data with date and time
    updateBookingData({
      date: formattedDate,
      time: selectedTimeSlot,
    })

    // Navigate to details page
    router.push(`/booking/details?zip=${zipCode}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Slideshow images={placeholderImages} className="absolute inset-0 bg-blend-overlay opacity-50" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">SCHEDULE YOUR SERVICE</CardTitle>
              <CardDescription className="mt-2">Select a date and time for your cleaning service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Select a Date</h3>
                  <div className="flex items-center justify-center">
                    {/* Logo on the left side of calendar */}
                    <div className="hidden md:block mr-6">
                      <Image
                        src="/images/f5-logo.png"
                        alt="F5 Carpet Cleaning"
                        width={120}
                        height={150}
                        className="object-contain"
                      />
                    </div>

                    {/* Calendar */}
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={isDateUnavailable}
                      fromDate={today}
                      toDate={threeMonthsLater}
                      className="rounded-md border"
                    />

                    {/* Logo on the right side of calendar */}
                    <div className="hidden md:block ml-6">
                      <Image
                        src="/images/f5-logo.png"
                        alt="F5 Carpet Cleaning"
                        width={120}
                        height={150}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Mobile view - logos above and below calendar */}
                  <div className="flex justify-center md:hidden my-4">
                    <Image
                      src="/images/f5-logo.png"
                      alt="F5 Carpet Cleaning"
                      width={100}
                      height={125}
                      className="object-contain"
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
                              : "border-green-500 bg-green-50 hover:bg-green-100"
                          }`}
                          onClick={() => handleTimeSlotSelect(timeSlot)}
                        >
                          <Clock className="h-4 w-4 mr-2 text-green-500" />
                          <span className="flex-1">{timeSlot}</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {date && selectedTimeSlot && (
                  <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                    <h3 className="font-bold text-lg mb-2">Pricing Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Standard Carpet Cleaning:</span>
                        <span>$89.00</span>
                      </div>

                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total Price:</span>
                        <span>$89.00</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleContinue}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    disabled={!date || !selectedTimeSlot}
                  >
                    Continue
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
