"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Home, Building } from "lucide-react"
import { createBooking } from "@/app/actions/booking"
import { supabase } from "@/lib/supabase"
import { useBooking } from "@/lib/booking-context"
import { checkZipCodeInServiceArea } from "@/app/actions/check-zip-code"

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

// Room names mapping
const roomNames = {
  carpet: {
    bedroom: "Bedroom/Living Room",
    hallway: "Hallway",
    stairs: "Stairs",
    "area-rug": "Area Rug",
    "walk-in-closet": "Walk-in Closet",
  },
  upholstery: {
    sofa: "Sofa",
    loveseat: "Loveseat",
    recliner: "Recliner",
    "dining-chair": "Dining Chair",
    sectional: "Sectional",
    ottoman: "Ottoman",
    mattress: "Mattress",
    "fabric-headboard": "Fabric Headboard",
    "fabric-bed": "Entire Fabric Bed",
    "sofa-chair": "Sofa Chair",
    chaise: "Chaise",
  },
  tile: {
    "square-footage": "Square Footage",
    "grout-sealant": "Grout Sealant",
    kitchen: "Kitchen",
    bathroom: "Bathroom",
    entryway: "Entryway",
    bedroom: "Bedroom",
    "living-room": "Living Room",
  },
}

export default function DetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRebooking = searchParams.get("rebook") === "true"
  const customerId = searchParams.get("customerId") || ""

  const { bookingData, updateBookingData } = useBooking()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    unitNumber: "",
    city: "",
    state: "",
    specialInstructions: "",
  })

  const [propertyType, setPropertyType] = useState<"house" | "apartment" | null>(null)
  const [floors, setFloors] = useState<number>(1)
  const [floorLevel, setFloorLevel] = useState<"1st" | "2nd" | null>(null)

  // Add a form error field to the errors state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zipCodeStatus, setZipCodeStatus] = useState<"unchecked" | "checking" | "valid" | "invalid">("unchecked")

  // Initialize form data from booking context
  useEffect(() => {
    setFormData({
      firstName: bookingData.firstName || "",
      lastName: bookingData.lastName || "",
      email: bookingData.email || "",
      phone: bookingData.phone || "",
      address: bookingData.address || "",
      unitNumber: bookingData.unitNumber || "",
      city: bookingData.city || "",
      state: bookingData.state || "",
      specialInstructions: bookingData.specialInstructions || "",
    })

    if (bookingData.propertyType) {
      setPropertyType(bookingData.propertyType)
    }

    if (bookingData.floors) {
      setFloors(bookingData.floors)
    }

    if (bookingData.floorLevel) {
      setFloorLevel(bookingData.floorLevel)
    }

    // Check zip code validity when component loads
    if (bookingData.zipCode) {
      validateZipCode(bookingData.zipCode)
    }
  }, [bookingData])

  // Add this useEffect to pre-fill customer data if rebooking
  useEffect(() => {
    if (isRebooking && customerId) {
      // Fetch customer data from Supabase
      const fetchCustomerData = async () => {
        try {
          const { data, error } = await supabase.from("customers").select("*").eq("id", customerId).single()

          if (error) {
            console.error("Error fetching customer data:", error)
            return
          }

          if (data) {
            const newFormData = {
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              unitNumber: data.unit_number || "",
              city: data.city || "",
              state: data.state || "",
              specialInstructions: data.special_instructions || "",
            }

            setFormData(newFormData)

            // Also update booking context
            updateBookingData({
              firstName: newFormData.firstName,
              lastName: newFormData.lastName,
              email: newFormData.email,
              phone: newFormData.phone,
              address: newFormData.address,
              unitNumber: newFormData.unitNumber,
              city: newFormData.city,
              state: newFormData.state,
              specialInstructions: newFormData.specialInstructions,
            })

            // Set property type and related fields if available
            if (data.property_type) {
              setPropertyType(data.property_type as "house" | "apartment" | null)
              updateBookingData({ propertyType: data.property_type as "house" | "apartment" | null })

              if (data.property_type === "house" && data.floors) {
                setFloors(data.floors)
                updateBookingData({ floors: data.floors })
              } else if (data.property_type === "apartment" && data.floor_level) {
                setFloorLevel(data.floor_level as "1st" | "2nd" | null)
                updateBookingData({ floorLevel: data.floor_level as "1st" | "2nd" | null })
              }
            }
          }
        } catch (error) {
          console.error("An error occurred while fetching customer data:", error)
        }
      }

      fetchCustomerData()
    }
  }, [isRebooking, customerId, updateBookingData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Fixed property type selection logic - UPDATED
  const handlePropertyTypeChange = (type: "house" | "apartment") => {
    // Always allow switching between property types
    setPropertyType(type)

    // Reset related fields when changing property type
    if (type === "house") {
      setFloorLevel(null)
      setFloors(1)
    } else if (type === "apartment") {
      setFloors(1)
      setFloorLevel(null)
    }

    // Clear any property type related errors
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.propertyType
      delete newErrors.floorLevel
      return newErrors
    })
  }

  // Validate zip code with the server
  const validateZipCode = async (zipCode: string) => {
    // Basic format validation
    if (!zipCode || zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      setErrors((prev) => ({ ...prev, zipCode: "Please enter a valid 5-digit ZIP code" }))
      setZipCodeStatus("invalid")
      return false
    }

    setZipCodeStatus("checking")

    try {
      // Check if zip code is in service area
      const result = await checkZipCodeInServiceArea(zipCode)
      console.log("Zip code check result:", result)

      if (result.isInServiceArea) {
        setZipCodeStatus("valid")
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.zipCode
          return newErrors
        })

        // If we have city/state data, update the form
        if (result.locationData) {
          setFormData((prev) => ({
            ...prev,
            city: prev.city || result.locationData?.city || "",
            state: prev.state || result.locationData?.state || "",
          }))
        }

        return true
      } else {
        setZipCodeStatus("invalid")
        setErrors((prev) => ({
          ...prev,
          zipCode: "This ZIP code is not in our service area",
        }))
        return false
      }
    } catch (error) {
      console.error("Error validating zip code:", error)
      setZipCodeStatus("invalid")
      setErrors((prev) => ({
        ...prev,
        zipCode: "Error checking ZIP code. Please try again.",
      }))
      return false
    }
  }

  const validateForm = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"

    // Email is now optional, but validate format if provided
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid"
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!propertyType) newErrors.propertyType = "Property type is required"
    if (propertyType === "apartment" && !floorLevel) newErrors.floorLevel = "Floor level is required"

    // Validate zip code
    const zipCode = bookingData.zipCode || ""
    if (!zipCode) {
      newErrors.zipCode = "ZIP code is required"
    } else if (zipCodeStatus === "unchecked") {
      // If zip code hasn't been checked yet, validate it now
      const isValid = await validateZipCode(zipCode)
      if (!isValid) {
        newErrors.zipCode = "Please enter a valid 5-digit ZIP code in our service area"
      }
    } else if (zipCodeStatus === "invalid") {
      newErrors.zipCode = "Please enter a valid 5-digit ZIP code in our service area"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      const isValid = await validateForm()
      if (!isValid) {
        setIsSubmitting(false)
        return
      }

      // Update booking context with form data
      updateBookingData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        unitNumber: formData.unitNumber,
        city: formData.city,
        state: formData.state,
        propertyType,
        floors: propertyType === "house" ? floors : undefined,
        floorLevel: propertyType === "apartment" ? floorLevel : undefined,
        specialInstructions: formData.specialInstructions,
      })

      // Convert room selections to the format expected by the createBooking function
      const roomsData = bookingData.rooms.map((room) => ({
        serviceId: room.serviceId,
        roomId: room.roomId,
        count: room.count,
        isActive: room.isActive,
      }))

      // Create the booking data
      const bookingFormData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        unitNumber: formData.unitNumber,
        city: formData.city,
        state: formData.state,
        zipCode: bookingData.zipCode,
        propertyType,
        floors: propertyType === "house" ? floors : undefined,
        floorLevel: propertyType === "apartment" ? floorLevel : undefined,
        specialInstructions: formData.specialInstructions,
        services: bookingData.services,
        rooms: roomsData,
        date: bookingData.date || "",
        dayOfWeek: bookingData.dayOfWeek || "",
        time: bookingData.time || "",
        totalPrice: bookingData.price,
      }

      // Submit the booking - FIX: Pass the object directly, not as FormData
      const result = await createBooking(bookingFormData)

      if (result.success) {
        // Navigate to confirmation page
        router.push(`/booking/confirmation?id=${result.bookingId}&confirmation=${result.confirmationNumber}`)
      } else {
        setErrors({ form: result.error || "Failed to create booking. Please try again." })
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      setErrors({ form: "An unexpected error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle zip code change
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZipCode = e.target.value.replace(/\D/g, "").slice(0, 5)
    updateBookingData({ zipCode: newZipCode })

    // Reset zip code status when user changes the value
    setZipCodeStatus("unchecked")

    // Clear zip code error
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.zipCode
      return newErrors
    })
  }

  // Handle zip code blur
  const handleZipCodeBlur = () => {
    if (bookingData.zipCode && bookingData.zipCode.length === 5) {
      validateZipCode(bookingData.zipCode)
    }
  }

  // Function to render the items summary
  const renderItemsSummary = () => {
    if (!bookingData.rooms || bookingData.rooms.length === 0) {
      return <p className="text-gray-500 italic">No items selected</p>
    }

    // Group rooms by service type
    const groupedRooms = bookingData.rooms.reduce((acc, room) => {
      if (!acc[room.serviceId]) {
        acc[room.serviceId] = []
      }
      acc[room.serviceId].push(room)
      return acc
    }, {})

    return (
      <div className="space-y-3">
        {Object.keys(groupedRooms).map((serviceId) => (
          <div key={serviceId} className="space-y-1">
            <h4 className="font-medium text-sm">{serviceNames[serviceId] || serviceId}</h4>
            <ul className="text-sm">
              {groupedRooms[serviceId].map((room) => {
                const roomName = roomNames[room.serviceId]?.[room.roomId] || room.roomId
                return (
                  <li
                    key={`${room.serviceId}-${room.roomId}`}
                    className="flex justify-between py-1 border-b border-gray-100 last:border-0"
                  >
                    <span>{roomName}</span>
                    <span className="font-medium">
                      {room.count} {room.count > 1 ? "items" : "item"}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {bookingData.services
          .filter((service) => service.startsWith("pet-") || service.startsWith("carpet-"))
          .map((service) => (
            <div key={service} className="py-1 border-b border-gray-100 last:border-0">
              <span className="text-sm">{serviceNames[service] || service}</span>
            </div>
          ))}
      </div>
    )
  }

  // Format a date for display in the UI with day of week
  const formatSelectedDate = (dateString: string, dayOfWeek: string | null) => {
    if (!dateString) return "Not selected"

    // Parse the date string (YYYY-MM-DD)
    const [year, month, day] = dateString.split("-").map(Number)

    // Create a date object for month name
    const date = new Date(year, month - 1, day)
    const monthName = date.toLocaleString("default", { month: "short" })

    // Use the provided day of week instead of calculating it
    return `${dayOfWeek || ""}, ${monthName} ${day}`
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="container mx-auto px-4 py-8">
        <Link href="/booking/schedule" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schedule
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">YOUR DETAILS</CardTitle>
              <CardDescription className="mt-2">Please provide your contact and location details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {serviceError && (
                  <div className="bg-red-50 p-4 rounded-md mb-4">
                    <p className="text-red-600 font-medium">Service Error</p>
                    <p className="text-red-500 text-sm">{serviceError}</p>
                    <p className="text-sm mt-2">Please try refreshing the page or starting your booking again.</p>
                  </div>
                )}
                {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit/Apt Number (if applicable)</Label>
                  <Input
                    id="unitNumber"
                    name="unitNumber"
                    value={formData.unitNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., Apt 101, Unit B"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} />
                    {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={bookingData.zipCode || ""}
                      onChange={handleZipCodeChange}
                      onBlur={handleZipCodeBlur}
                      className={errors.zipCode ? "border-red-500" : ""}
                      maxLength={5}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
                    {zipCodeStatus === "checking" && <p className="text-blue-500 text-sm">Checking ZIP code...</p>}
                    {zipCodeStatus === "valid" && <p className="text-green-500 text-sm">ZIP code is valid</p>}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label>Property Type</Label>
                  {errors.propertyType && <p className="text-red-500 text-sm">{errors.propertyType}</p>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* House option - updated to always allow selection */}
                    <div
                      className={`flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
                        propertyType === "house" ? "border-yellow-500 bg-yellow-50" : ""
                      }`}
                      onClick={() => handlePropertyTypeChange("house")}
                    >
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        <Label className="cursor-pointer">House</Label>
                      </div>
                    </div>

                    {/* Apartment option - updated to always allow selection */}
                    <div
                      className={`flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
                        propertyType === "apartment" ? "border-yellow-500 bg-yellow-50" : ""
                      }`}
                      onClick={() => handlePropertyTypeChange("apartment")}
                    >
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        <Label className="cursor-pointer">Apartment/Condo</Label>
                      </div>
                    </div>
                  </div>

                  {propertyType === "house" && (
                    <div className="pt-2">
                      <Label htmlFor="floors">Number of Floors</Label>
                      <Select value={floors.toString()} onValueChange={(value) => setFloors(Number.parseInt(value))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select number of floors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Floor</SelectItem>
                          <SelectItem value="2">2 Floors</SelectItem>
                          <SelectItem value="3">3 Floors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {propertyType === "apartment" && (
                    <div className="pt-2">
                      <Label htmlFor="floorLevel">Floor Level</Label>
                      <Select
                        value={floorLevel || ""}
                        onValueChange={(value) => setFloorLevel(value as "1st" | "2nd" | null)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select floor level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">1st Floor</SelectItem>
                          <SelectItem value="2nd">2nd Floor or Higher</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.floorLevel && <p className="text-red-500 text-sm">{errors.floorLevel}</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="Any special instructions or notes for our technicians"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Booking Summary</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{formatSelectedDate(bookingData.date || "", bookingData.dayOfWeek)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{bookingData.time || "Not selected"}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-yellow-200">
                      <h4 className="font-medium mb-2">Services Selected:</h4>
                      <div className="mb-2">
                        {bookingData.services.map((id) => (
                          <div key={id} className="flex justify-between py-1">
                            <span>{serviceNames[id] || id}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-yellow-200">
                      <h4 className="font-medium mb-2">Items Selected:</h4>
                      {renderItemsSummary()}
                    </div>

                    <div className="pt-2 border-t border-yellow-200">
                      <div className="flex justify-between font-bold">
                        <span>Total Price:</span>
                        <span>${bookingData.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Complete Booking"}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
