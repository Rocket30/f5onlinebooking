"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Slideshow } from "@/components/slideshow"
import { useBooking } from "@/lib/booking-context"

const placeholderImages = [
  "/placeholder.svg?height=1080&width=1920&text=Clean+Carpets",
  "/placeholder.svg?height=1080&width=1920&text=Fresh+Upholstery",
  "/placeholder.svg?height=1080&width=1920&text=Sparkling+Tiles",
]

const services = [
  {
    id: "carpet",
    name: "Carpet Cleaning",
    description: "Deep clean your carpets to remove dirt, stains, and allergens",
    icon: "🧹",
  },
  {
    id: "upholstery",
    name: "Upholstery Cleaning",
    description: "Refresh your furniture and remove embedded dirt and odors",
    icon: "🛋️",
  },
  {
    id: "tile",
    name: "Tile & Grout Cleaning",
    description: "Restore the original beauty of your tile floors and surfaces",
    icon: "🧽",
  },
]

export default function ServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { bookingData, updateBookingData, addService, removeService } = useBooking()
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    setSelectedServices(bookingData.services)
  }, [bookingData.services])

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        removeService(serviceId)
        return prev.filter((id) => id !== serviceId)
      } else {
        addService(serviceId)
        return [...prev, serviceId]
      }
    })
  }

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      setError("Please select at least one service")
      return
    }

    router.push("/booking/rooms")
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Slideshow images={placeholderImages} className="absolute inset-0 bg-blend-overlay opacity-50" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/booking" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Zip Code
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">SELECT SERVICES</CardTitle>
              <CardDescription className="mt-2">Choose the services you need</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedServices.includes(service.id)
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="text-3xl">{service.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    </div>
                  </div>
                ))}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end pt-4">
                  <Button onClick={handleContinue} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    Continue to Rooms
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
