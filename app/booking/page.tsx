"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { checkZipCodeInServiceArea } from "@/app/actions/check-zip-code"
import { Slideshow } from "@/components/slideshow"
import { useBooking } from "@/lib/booking-context"

const placeholderImages = [
  "/placeholder.svg?height=1080&width=1920&text=Clean+Carpets",
  "/placeholder.svg?height=1080&width=1920&text=Fresh+Upholstery",
  "/placeholder.svg?height=1080&width=1920&text=Sparkling+Tiles",
]

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [zipCode, setZipCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { resetBooking, bookingData, updateBookingData } = useBooking()

  const directZip = searchParams?.get("zip")

  useEffect(() => {
    if (bookingData.services.length > 0 || bookingData.rooms.length > 0) {
      resetBooking()
    }

    if (directZip) {
      setZipCode(directZip)
    }
  }, [resetBooking, bookingData.services.length, bookingData.rooms.length, directZip])

  const handleContinue = async () => {
    if (!zipCode || zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      setError("Please enter a valid 5-digit ZIP code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await checkZipCodeInServiceArea(zipCode)

      if (result.isInServiceArea) {
        updateBookingData({ zipCode })
        router.push(`/booking/services?zip=${zipCode}`)
      } else {
        setError("We're sorry, but we don't currently service your area. Please contact us for more information.")
      }
    } catch (err) {
      setError("An error occurred while checking service availability. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseCurrentLocation = () => {
    setIsLoading(true)
    setError("")

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const placeholderZip = "33602"

          try {
            const result = await checkZipCodeInServiceArea(placeholderZip)

            if (result.isInServiceArea) {
              setZipCode(placeholderZip)
              updateBookingData({ zipCode: placeholderZip })
              router.push(`/booking/services?zip=${placeholderZip}`)
            } else {
              setError("We're sorry, but we don't currently service your area. Please contact us for more information.")
            }
          } catch (err) {
            setError("An error occurred while checking service availability. Please try again.")
          } finally {
            setIsLoading(false)
          }
        },
        (error) => {
          setIsLoading(false)
          setError("Unable to get your location. Please enter your ZIP code manually.")
        },
      )
    } else {
      setIsLoading(false)
      setError("Geolocation is not supported by your browser. Please enter your ZIP code manually.")
    }
  }

  const handleManualReset = () => {
    resetBooking()
    setZipCode("")
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Slideshow images={placeholderImages} className="absolute inset-0 bg-blend-overlay opacity-50" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">BUILD YOUR QUOTE</CardTitle>
              <CardDescription className="text-xl font-bold mt-4">PLEASE ENTER YOUR ZIP CODE</CardDescription>
              <CardDescription className="mt-2">
                Tell us the ZIP code of the location you wish to have serviced.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="ZIP Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    maxLength={5}
                    className="text-lg"
                  />
                  {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Checking..." : "CONTINUE"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-center text-gray-600"
                  onClick={handleUseCurrentLocation}
                  disabled={isLoading}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Use my current location
                </Button>

                <div className="border-t pt-4 mt-4">
                  <div className="text-center">
                    <span className="text-gray-500">Already have an account?</span>{" "}
                    <Link href="/booking/sign-in" className="text-yellow-600 hover:underline font-medium">
                      SIGN IN
                    </Link>
                  </div>
                  <div className="text-center mt-2">
                    <Link href="/booking/history" className="text-yellow-600 hover:underline font-medium">
                      VIEW BOOKING HISTORY
                    </Link>
                  </div>
                  <div className="text-center mt-2">
                    <Button
                      variant="ghost"
                      className="text-yellow-600 hover:underline font-medium flex items-center justify-center"
                      onClick={handleManualReset}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset Booking Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
